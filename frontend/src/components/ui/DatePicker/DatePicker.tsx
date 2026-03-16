import * as React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import * as Select from '@radix-ui/react-select'

import { cn } from '@lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import styles from './DatePicker.module.css'

export interface DatePickerProps {
  date?: string
  onDateChange?: (dateISO: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  highlightedDate?: string
  isCross?: boolean
}

function ensureDate(value: any): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

function DatePicker_({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  highlightedDate,
  isCross = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(ensureDate(date))
  const [manualDate, setManualDate] = React.useState<string>(date ?? '')
  const [calendarKey, setCalendarKey] = React.useState(0)

  // Synchroniser date
  React.useEffect(() => {
    const d = ensureDate(date)
    if (d && (!selectedDate || d.getTime() !== selectedDate.getTime())) {
      setSelectedDate(d)
      setManualDate(d.toISOString().slice(0, 10))
    }
  }, [date])

  // Expose selectedDate en string ISO
  React.useEffect(() => {
    if (onDateChange) {
      onDateChange(selectedDate ? selectedDate.toISOString() : undefined)
    }
  }, [selectedDate, onDateChange])

  // Ensure the initial value of `selectedDate` and `manualDate` is synchronized with the `date` prop
  React.useEffect(() => {
    const initialDate = ensureDate(date);
    if (initialDate) {
      setSelectedDate(initialDate);
      setManualDate(initialDate.toISOString().slice(0, 10));
    }
  }, []);

  const handleClear = () => {
    setSelectedDate(undefined)
    setManualDate('')
    onDateChange?.(undefined)
  }

  const handleCalendarSelect = (newDate: Date | undefined) => {
    const valid = ensureDate(newDate)
    setSelectedDate(valid)
    if (valid) setManualDate(valid.toISOString().slice(0, 10))
    setOpen(false)
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setManualDate(val)
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      setSelectedDate(parsed)
      setCalendarKey((k) => k + 1)
    }
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  const years = Array.from({ length: 201 }, (_, i) => new Date().getFullYear() - 100 + i)

  const handleSelectChange = (type: 'day' | 'month' | 'year', value: number | string) => {
    const current = selectedDate || new Date()
    const newDate = new Date(current)
    if (type === 'day') newDate.setDate(Number(value))
    if (type === 'month') newDate.setMonth(months.indexOf(value as string))
    if (type === 'year') newDate.setFullYear(Number(value))
    setSelectedDate(newDate)
    setManualDate(newDate.toISOString().slice(0, 10))
    setCalendarKey((k) => k + 1)
  }

  const renderSelect = (
    items: (number[] | string[]),
    value: number | string | undefined,
    type: 'day' | 'month' | 'year',
    placeholderText: string,
    widthClass: string
  ) => (
    <Select.Root
      value={value ? value.toString() : ''}
      onValueChange={(v) => handleSelectChange(type, v)}
      disabled={disabled}
    >
      <Select.Trigger className={cn('border rounded-[24px] px-2 py-1 flex items-center justify-between')}>
        <Select.Value placeholder={placeholderText} />
        <Select.Icon><ChevronDown className="w-4 h-4" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.selectContent}>
          <Select.ScrollUpButton className="flex justify-center items-center h-6"><ChevronUp className="w-4 h-4" /></Select.ScrollUpButton>
          <Select.Viewport>
            {items.map((item) => (
              <Select.Item key={item} value={item.toString()} className="px-2 py-1 cursor-pointer hover:bg-purple-100 hover:text-purple-600 hover:rounded-md relative flex items-center justify-center">
                <Select.ItemText>{item}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-0 w-4 flex justify-center text-purple-600 pr-[4px]">
                  <Check className="w-4 h-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex justify-center items-center h-6"><ChevronDown className="w-4 h-4" /></Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )

  // Click outside pour fermer
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.date-picker-container')) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="date-picker-container relative">
      <Button variant="outline" className={cn(styles.button, className)} disabled={disabled} onClick={() => setOpen((p) => !p)}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? format(selectedDate, 'PPP', { locale: fr }) : placeholder}
      </Button>

      {open && (
        <div className={styles.popoverContent}>
          <div className="flex items-center space-x-2">
            {renderSelect(days, selectedDate?.getDate(), 'day', 'Jour', styles.selectTrigger)}
            {renderSelect(months, selectedDate ? months[selectedDate.getMonth()] : undefined, 'month', 'Mois', styles.selectTrigger)}
            {renderSelect(years, selectedDate?.getFullYear(), 'year', 'Année', styles.selectTrigger)}
          </div>

          <Calendar
            key={calendarKey}
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            defaultMonth={selectedDate}
            locale={fr}
            modifiers={{
              highlighted: highlightedDate ? [ensureDate(highlightedDate)!] : [],
            }}
            modifiersClassNames={{ highlighted: styles.calendarModifiersHighlighted }}
          />
        </div>
      )}

      {isCross && selectedDate && (
        <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted z-50" onClick={handleClear}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

const DatePicker = React.forwardRef(DatePicker_)
export default DatePicker
