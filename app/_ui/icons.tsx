export type IconName = "home" | "collective" | "learn" | "spaces" | "library" | "account" | "lock" | "play" | "arrow" | "message";

const paths: Record<IconName, React.ReactNode> = {
  home: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /></>,
  collective: <><circle cx="8.5" cy="10" r="4.5" /><circle cx="15.5" cy="10" r="4.5" /><circle cx="12" cy="16" r="4.5" /></>,
  learn: <><path d="M4 6.5h16M4 12h11M4 17.5h7" /><circle cx="18.5" cy="16.5" r="2" /></>,
  spaces: <><path d="M12 3.5 19.5 8v8L12 20.5 4.5 16V8Z" /><path d="M4.5 8 12 12.5 19.5 8M12 12.5v8" /></>,
  library: <><path d="M5 4.5v15M9.5 4.5v15M14 5.5l4.5 13.5" /></>,
  account: <><circle cx="12" cy="9" r="3.5" /><path d="M5 19.5c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="9" rx="1.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  play: <path d="M8 5.5v13l10-6.5Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  message: <><path d="M4.5 6.5h15v9h-9l-4 3v-3h-2Z" /></>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {paths[name]}
  </svg>;
}

/** Seven-circle seed figure used as the Synestharium mark. */
export function SeedMark({ size = 22 }: { size?: number }) {
  const r = 5;
  const centres = [[12, 12], ...Array.from({ length: 6 }, (_, i) => {
    const angle = i * Math.PI / 3;
    return [12 + Math.cos(angle) * r, 12 + Math.sin(angle) * r];
  })];
  return <svg className="seed-mark" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1" aria-hidden="true" focusable="false">
    {centres.map(([x, y], i) => <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r={r} />)}
  </svg>;
}
