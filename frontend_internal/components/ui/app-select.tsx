'use client'

import Select from 'react-select'

export type SelectOption = { value: string; label: string }

export function AppSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
}: {
  options: SelectOption[]
  value: SelectOption | null
  onChange: (value: SelectOption | null) => void
  placeholder?: string
}) {
  return (
    <Select
      unstyled
      isClearable
      instanceId={placeholder}
      options={options}
      value={value}
      onChange={(v) => onChange(v as SelectOption | null)}
      placeholder={placeholder}
      noOptionsMessage={() => 'Tidak ditemukan'}
      classNames={{
        container: () => 'w-full',
        control: (state) =>
          `!min-h-0 cursor-pointer rounded-lg px-1 py-1 transition-colors ${
            state.isFocused ? 'ring-2 ring-primary/30' : ''
          }`,
        placeholder: () => 'text-sm text-muted-foreground',
        singleValue: () => 'text-sm text-foreground',
        input: () => 'text-sm text-foreground',
        indicatorsContainer: () => 'gap-0.5',
        dropdownIndicator: () => 'text-muted-foreground px-1',
        clearIndicator: () => 'text-muted-foreground px-1 hover:text-foreground',
        indicatorSeparator: () => 'hidden',
        menu: () =>
          'mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl z-50',
        menuList: () => 'max-h-56 overflow-y-auto py-1',
        option: (state) =>
          `cursor-pointer px-3 py-2 text-sm transition-colors ${
            state.isSelected
              ? 'bg-primary/10 font-semibold text-primary'
              : state.isFocused
                ? 'bg-secondary text-foreground'
                : 'text-foreground'
          }`,
        noOptionsMessage: () => 'py-3 text-center text-sm text-muted-foreground',
      }}
    />
  )
}
