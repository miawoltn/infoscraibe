'use client';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';
import { SelectHTMLAttributes, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Select } from '../SettingsDialog';

type Theme = 'dark' | 'light' | 'system';

const ThemeSwitcher = ({ className, size }: { className?: string, size?: number }) => {
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  const isTheme = useCallback((t: Theme) => t === theme, [theme]);

  const handleThemeSwitch = (theme: Theme) => {
    setTheme(theme);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTheme('system')) {
      const preferDarkScheme = window.matchMedia(
        '(prefers-color-scheme: dark)',
      );

      const detectThemeChange = (event: MediaQueryListEvent) => {
        const theme: Theme = event.matches ? 'dark' : 'light';
        setTheme(theme);
      };

      preferDarkScheme.addEventListener('change', detectThemeChange);

      return () => {
        preferDarkScheme.removeEventListener('change', detectThemeChange);
      };
    }
  }, [isTheme, setTheme, theme]);

  // Avoid Hydration Mismatch
  if (!mounted) {
    return null;
  }

  return (
    //   <select value={theme} onChange={e => setTheme(e.target.value)}>
    //   <option value="system">System</option>
    //   <option value="dark">Dark</option>
    //   <option value="light">Light</option>
    // </select>
    // <Select
    //   className={className}
    //   value={theme}
    //   onChange={(e) => handleThemeSwitch(e.target.value as Theme)}
    //   options={[
    //     { value: 'light', label: 'Light' },
    //     { value: 'dark', label: 'Dark' }
    //   ]}
    // />

    <Select defaultValue={theme} onValueChange={(e) => handleThemeSwitch(e as Theme)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className='cursor-pointer' value="light">Light</SelectItem>
        <SelectItem className='cursor-pointer' value="dark">Dark</SelectItem>
        <SelectItem className='cursor-pointer' value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ThemeSwitcher;
