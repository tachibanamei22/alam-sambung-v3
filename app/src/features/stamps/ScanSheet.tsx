import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { parseStampToken } from './booths'

interface Detector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>
}
type DetectorCtor = new (options?: { formats?: string[] }) => Detector

type CameraState = 'starting' | 'on' | 'unsupported' | 'denied'

function detectorCtor(): DetectorCtor | undefined {
  return (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector
}

function cameraSupported(): boolean {
  return Boolean(detectorCtor() && navigator.mediaDevices?.getUserMedia)
}

interface ScanSheetProps {
  onToken: (token: string) => void
  onClose: () => void
}

/**
 * Camera scanning uses the BarcodeDetector API where the browser has it.
 * Everywhere else visitors can use their phone's camera app (the QR opens the
 * stamp link) or type the short code printed under the QR.
 */
export function ScanSheet({ onToken, onClose }: ScanSheetProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [camera, setCamera] = useState<CameraState>(() => (cameraSupported() ? 'starting' : 'unsupported'))
  const [code, setCode] = useState('')

  useEffect(() => {
    const Ctor = detectorCtor()
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) return

    let stream: MediaStream | null = null
    let timer: number | undefined
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (cancelled) {
          for (const track of s.getTracks()) track.stop()
          return
        }
        stream = s
        const video = videoRef.current
        if (!video) return
        video.srcObject = s
        void video.play()
        setCamera('on')
        const detector = new Ctor({ formats: ['qr_code'] })
        timer = window.setInterval(() => {
          detector
            .detect(video)
            .then((found) => {
              if (found[0]) onToken(parseStampToken(found[0].rawValue))
            })
            .catch(() => {
              // a frame that cannot be read is skipped
            })
        }, 400)
      })
      .catch(() => setCamera('denied'))

    return () => {
      cancelled = true
      if (timer) window.clearInterval(timer)
      if (stream) for (const track of stream.getTracks()) track.stop()
    }
  }, [onToken])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (code.trim()) onToken(parseStampToken(code))
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60" role="dialog" aria-modal="true">
      <div className="flex w-full max-w-[520px] flex-col gap-4 rounded-t-[32px] bg-bg p-5 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-head text-xl font-bold">{t('stamps.scan')}</h2>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-soft"
          >
            <X className="size-[18px]" />
          </button>
        </div>

        {camera === 'on' || camera === 'starting' ? (
          <video
            ref={videoRef}
            muted
            playsInline
            className="aspect-square w-full rounded-[24px] bg-black object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface p-5 text-center text-sm text-muted">
            <Camera className="size-6 text-accent-text" />
            {camera === 'denied' ? t('stamps.cameraDenied') : t('stamps.cameraUnsupported')}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted" htmlFor="stamp-code">
            {t('stamps.enterCode')}
          </label>
          <div className="flex gap-2">
            <input
              id="stamp-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="as-booth-name"
              className="h-12 min-w-0 flex-1 rounded-2xl border border-border bg-surface px-3.5 text-[15px] outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="h-12 rounded-2xl bg-accent px-5 text-sm font-bold text-on-accent"
            >
              {t('stamps.submitCode')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
