"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm?: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    type?: "confirm" | "alert"
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    type = "confirm",
}: ConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {type === "confirm" && (
                        <Button variant="outline" onClick={onClose}>
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant={variant}
                        onClick={() => {
                            if (onConfirm) {
                                onConfirm()
                            }
                            onClose()
                        }}
                    >
                        {type === "confirm" ? confirmText : "Close"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
