'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, CheckCircle2 } from 'lucide-react'
import { KontakFormValues, KontakSchema, useCreateKontak } from '@/feature/web'

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const [namaTerkirim, setNamaTerkirim] = useState('')

  const { mutate: createKontak, isPending } = useCreateKontak()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KontakFormValues>({
    resolver: zodResolver(KontakSchema),
    defaultValues: {
      nama: '',
      email: '',
      subject: '',
      pesan: '',
    },
  })

  const onSubmit = (data: KontakFormValues) => {
    createKontak(data, {
      onSuccess: () => {
        setNamaTerkirim(data.nama)
        setSent(true)
        reset()
      },
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </span>

        <h3 className="mt-5 font-display text-xl font-bold text-foreground">
          Pesan Terkirim
        </h3>

        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Terima kasih, {namaTerkirim || 'Sdr/i'}. Pesan Anda telah kami terima
          dan akan segera ditindaklanjuti oleh tim JDIH BIN.
        </p>

        <button
          type="button"
          onClick={() => {
            setNamaTerkirim('')
            setSent(false)
          }}
          className="mt-6 rounded-md bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-border"
        >
          Kirim pesan lain
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-6 sm:p-8"
    >
      <h3 className="font-display text-xl font-bold text-foreground">
        Kirim Pesan
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">
        Sampaikan pertanyaan atau permohonan informasi hukum Anda.
      </p>

      {/* Nama & Email */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field
          label="Nama"
          htmlFor="nama"
          error={errors.nama?.message}
        >
          <input
            id="nama"
            type="text"
            {...register('nama')}
            placeholder="Nama lengkap"
            className={inputClass}
            disabled={isPending}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="nama@email.com"
            className={inputClass}
            disabled={isPending}
          />
        </Field>
      </div>

      {/* Subject */}
      <div className="mt-5">
        <Field
          label="Subject"
          htmlFor="subject"
          error={errors.subject?.message}
        >
          <input
            id="subject"
            type="text"
            {...register('subject')}
            placeholder="Perihal pesan"
            className={inputClass}
            disabled={isPending}
          />
        </Field>
      </div>

      {/* Pesan */}
      <div className="mt-5">
        <Field
          label="Pesan"
          htmlFor="pesan"
          error={errors.pesan?.message}
        >
          <textarea
            id="pesan"
            rows={5}
            {...register('pesan')}
            placeholder="Tuliskan pesan Anda..."
            className={`${inputClass} resize-y`}
            disabled={isPending}
          />
        </Field>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Send className="h-4 w-4" />

        {isPending ? 'Mengirim...' : 'Kirim Pesan'}
      </button>
    </form>
  )
}

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60'

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
