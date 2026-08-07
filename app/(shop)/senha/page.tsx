import { ChangePasswordForm } from '@/components/change-password-form'

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold text-texto">Trocar senha</h1>
      <p className="mb-5 text-sm text-texto/50">
        Se você ainda usa a senha inicial, troque agora por uma só sua.
      </p>
      <ChangePasswordForm />
    </div>
  )
}
