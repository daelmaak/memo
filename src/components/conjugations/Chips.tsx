import { Component, For } from 'solid-js';

interface ChipsProps {
  chips: string[];
  selectedChips: string[];
  onChipsSelected(selectedChips: string[]): void;
}

export const Chips: Component<ChipsProps> = props => {
  const chipSelections = () =>
    props.chips.map(chip => ({
      chip,
      selected: props.selectedChips.includes(chip),
    }));

  const onChipsSelected = (chip: string, selected: boolean) => {
    if (selected) {
      props.onChipsSelected(props.selectedChips.concat(chip));
    } else {
      props.onChipsSelected(props.selectedChips.filter(c => c !== chip));
    }
  };

  return (
    <ul class="flex flex-wrap gap-3">
      <For each={chipSelections()}>
        {item => (
          <Chip
            chip={item.chip}
            selected={item.selected}
            onSelected={() => onChipsSelected(item.chip, !item.selected)}
          />
        )}
      </For>
    </ul>
  );
};

interface ChipProps {
  chip: string;
  selected: boolean;
  onSelected: () => void;
}

const Chip: Component<ChipProps> = props => (
  <li
    class="px-3 py-1 border border-solid rounded-lg border-zinc-400 text-sm text-zinc-300 cursor-pointer"
    onClick={props.onSelected}
  >
    {props.chip}
  </li>
);
