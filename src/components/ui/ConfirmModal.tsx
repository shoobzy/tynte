import { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal, ModalFooter } from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  icon?: ReactNode
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center py-2">
        {icon ? (
          <div className="mb-4">{icon}</div>
        ) : variant === 'destructive' ? (
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        ) : null}

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <ModalFooter className="justify-center !border-t-0 bg-transparent mt-4">
        <Button variant="outline" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
