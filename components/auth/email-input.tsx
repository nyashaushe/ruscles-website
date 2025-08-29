'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Mail, AlertCircle } from "lucide-react"

interface EmailInputProps extends Omit<React.ComponentProps<"input">, "type"> {
    label?: string
    error?: string
    showIcon?: boolean
}

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
    ({ className, label = "Email", error, showIcon = true, ...props }, ref) => {
        const [isValid, setIsValid] = React.useState<boolean | null>(null)

        const validateEmail = (email: string) => {
            if (!email) {
                setIsValid(null)
                return
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const isValidEmail = emailRegex.test(email)
            setIsValid(isValidEmail)
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            validateEmail(e.target.value)
            props.onChange?.(e)
        }

        return (
            <div className="space-y-2">
                {label && (
                    <Label
                        htmlFor={props.id}
                        className={cn(
                            "text-sm font-medium",
                            error && "text-destructive"
                        )}
                    >
                        {label}
                    </Label>
                )}
                <div className="relative">
                    {showIcon && (
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    )}
                    <Input
                        type="email"
                        className={cn(
                            showIcon && "pl-10",
                            error && "border-destructive focus-visible:ring-destructive",
                            isValid === false && "border-destructive focus-visible:ring-destructive",
                            isValid === true && "border-green-500 focus-visible:ring-green-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                        onChange={handleChange}
                        aria-invalid={!!error || isValid === false}
                        aria-describedby={error ? `${props.id}-error` : undefined}
                    />
                    {(error || isValid === false) && (
                        <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                    )}
                </div>
                {error && (
                    <p
                        id={`${props.id}-error`}
                        className="text-sm font-medium text-destructive"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {isValid === false && !error && (
                    <p className="text-sm text-destructive">
                        Please enter a valid email address
                    </p>
                )}
            </div>
        )
    }
)

EmailInput.displayName = "EmailInput"

export { EmailInput }