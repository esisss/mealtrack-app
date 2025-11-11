'use client'
import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface SearchBarSelectProps {
    items: any[],
    selected: string
    onSelect: (value: string) => void
    placeholder?: string
}

export const SearchBarSelect = ({
    items,
    selected,
    onSelect,
    placeholder = 'Search...',
}: SearchBarSelectProps) => {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')

    const filteredItems = React.useMemo(() => {
        if (!searchQuery) return items
        return items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [items, searchQuery])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selected
                        ? items.find((item) => item.value === selected)?.label
                        : placeholder}
                    <span className="ml-2 h-4 w-4 shrink-0 opacity-50">▼</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>No item found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                        {filteredItems.map((item) => (
                            <CommandItem
                                key={item.value}
                                onSelect={() => {
                                    onSelect(item.value)
                                    setSearchQuery('')
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        selected === item.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                {item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
