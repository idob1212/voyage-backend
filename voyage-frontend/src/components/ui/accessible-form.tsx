"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/accessibility";

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  description?: string;
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "tel" | "url";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function TextField({
  label,
  error,
  required,
  className,
  description,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  ...props
}: TextFieldProps) {
  const id = React.useId();
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={cn(
          descriptionId,
          errorId
        ).trim() || undefined}
        className={cn(error && "border-destructive focus:border-destructive")}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({
  label,
  error,
  required,
  className,
  description,
  placeholder,
  value,
  onChange,
  rows = 3,
  ...props
}: TextareaFieldProps) {
  const id = React.useId();
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={cn(
          descriptionId,
          errorId
        ).trim() || undefined}
        className={cn(error && "border-destructive focus:border-destructive")}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  error,
  required,
  className,
  description,
  options,
  value,
  onChange,
  placeholder,
  ...props
}: SelectFieldProps) {
  const id = React.useId();
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Select value={value} onValueChange={onChange} {...props}>
        <SelectTrigger
          id={id}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(
            descriptionId,
            errorId
          ).trim() || undefined}
          className={cn(error && "border-destructive focus:border-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckboxField({
  label,
  error,
  required,
  className,
  description,
  checked,
  onChange,
  ...props
}: CheckboxFieldProps) {
  const id = React.useId();
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(checked) => onChange?.(checked as boolean)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(
            descriptionId,
            errorId
          ).trim() || undefined}
          {...props}
        />
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </Label>
          
          {description && (
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}