export function ReadingValue({ value }: { value: number }) { return <span className={value < 2 || value > 8 ? 'temperature-danger' : 'temperature-normal'}>{value.toFixed(1)}°C</span>; }
