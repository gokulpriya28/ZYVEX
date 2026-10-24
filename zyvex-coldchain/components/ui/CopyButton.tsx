'use client';
export function CopyButton({ value }: { value: string }) { return <button type="button" onClick={() => void navigator.clipboard.writeText(value)}>Copy</button>; }
