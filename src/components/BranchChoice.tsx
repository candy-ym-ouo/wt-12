import type { Choice } from '../data/types';
import { useGameStore } from '../store/gameStore';
import { GlitchText } from './GlitchText';

interface BranchChoiceProps {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
  disabled?: boolean;
}

export function BranchChoice({ choices, onSelect, disabled = false }: BranchChoiceProps) {
  const hasFlag = useGameStore((s) => s.hasFlag);

  const availableChoices = choices.filter(
    (choice) => !choice.condition || hasFlag(choice.condition)
  );

  if (availableChoices.length === 0) {
    return (
      <div className="text-glitch-red text-shadow-glow-red mt-4">
        [ 没有可用的选项 ]
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      {availableChoices.map((choice, index) => (
        <button
          key={choice.id}
          disabled={disabled}
          onClick={() => onSelect(choice)}
          className="glitch-btn text-left !py-3 !px-4 group"
        >
          <span className="inline-flex items-center gap-3 w-full">
            <span className="text-glitch-yellow text-shadow-glow-yellow">
              [{index + 1}]
            </span>
            <GlitchText
              text={choice.text}
              intensity={0.5}
              charGlitch={false}
              className="group-hover:text-glitch-bg transition-colors"
            />
          </span>
        </button>
      ))}
    </div>
  );
}
