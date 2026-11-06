'use client'

import Select from 'react-select'
import { SelectOption } from './app-select'


export function AppMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
}: {
  options: SelectOption[]
  value: SelectOption[]
  onChange: (value: SelectOption[]) => void
  placeholder?: string
}) {
  return (
    <Select
      unstyled
      isMulti
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      instanceId={placeholder}
      options={options}
      value={value}
      onChange={(v) => onChange(v as SelectOption[])}
      placeholder={placeholder}
      noOptionsMessage={() => 'Tidak ditemukan'}
      classNames={{
        container: () => 'w-full',
        control: (state) =>
          `!min-h-0 cursor-pointer rounded-lg px-1 py-1 transition-colors ${
            state.isFocused ? 'ring-2 ring-primary/30' : ''
          }`,
        placeholder: () => 'text-sm text-muted-foreground',
        input: () => 'text-sm text-foreground',
        valueContainer: () => 'gap-1.5 flex-wrap py-0.5',
        multiValue: () =>
          'flex items-center gap-1 rounded-full bg-primary/10 pl-3 pr-1.5 py-1 my-0.5',
        multiValueLabel: () => 'text-xs font-semibold uppercase text-primary',
        multiValueRemove: () =>
          'rounded-full p-0.5 text-primary transition-colors hover:bg-primary/20',
        indicatorsContainer: () => 'gap-0.5',
        dropdownIndicator: () => 'text-muted-foreground px-1',
        clearIndicator: () => 'text-muted-foreground px-1 hover:text-foreground',
        indicatorSeparator: () => 'hidden',
        menu: () =>
          'mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl z-50',
        menuList: () => 'max-h-56 overflow-y-auto py-1',
        option: (state) =>
          `flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors ${
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