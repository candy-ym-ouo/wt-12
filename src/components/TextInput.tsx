import { useState, useEffect, useRef, useCallback } from 'react';

interface TextInputProps {
  hint?: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  onTyping?: () => void;
  onError?: () => void;
}

export function TextInput({ hint = '> 输入指令...', onSubmit, disabled = false, onTyping, onError }: TextInputProps) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (disabled || !value.trim()) {
        if (!value.trim()) {
          setShake(true);
          onError?.();
          setTimeout(() => setShake(false), 200);
        }
        return;
      }
      onSubmit(value.trim());
      setValue('');
    },
    [disabled, value, onSubmit, onError]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onTyping?.();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative flex items-center gap-2 ${
          shake ? 'animate-glitch-horizontal' : ''
        }`}
      >
        <span className="text-glitch-green text-shadow-glow-green select-none">
          {'>'}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={hint}
          className="glitch-input"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={disabled}
          className="glitch-btn !py-1 !px-3 !text-sm hidden sm:block"
        >
          发送
        </button>
      </div>
      <p className="text-xs text-glitch-blue/60 mt-2 text-shadow-glow-blue">{hint}</p>
    </form>
  );
}
