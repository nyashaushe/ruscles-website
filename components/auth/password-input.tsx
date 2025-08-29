'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
    label?: string
    error?: string
    showIcon?: boolean
    showToggle?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({
        className,
        label = "Password",
        error,
        showIcon = true,
        showToggle = true,
        ...props
    }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword)
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
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    )}
                    <Input
                        type={showPassword ? "text" : "password"}
                        className={cn(
                            showIcon && "pl-10",
                            showToggle && "pr-10",
                            error && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                        ref={ref}
                        {...props}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${props.id}-error` : undefined}
                    />
                    {showToggle && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    )}
                    {error && (
                        <AlertCircle className={cn(
                            "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-destructive",
                            showToggle ? "right-10" : "right-3"
                        )} />
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
            </div>
        )
    }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }