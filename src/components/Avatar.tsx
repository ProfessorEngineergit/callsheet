import { useData } from '@/store/data';
import { colorFromString, getInitials, cn } from '@/lib/utils';

export function Avatar({
  name,
  color,
  initials,
  size = 22,
  title,
}: {
  name: string;
  color?: string;
  initials?: string;
  size?: number;
  title?: string;
}) {
  return (
    <span
      title={title ?? name}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{
        width: size,
        height: size,
        background: color ?? colorFromString(name),
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initials ?? getInitials(name)}
    </span>
  );
}

// Avatar für eine Person/Freitext anhand ihrer ID (oder Roh-Name).
export function PersonAvatar({ id, size = 22 }: { id: string; size?: number }) {
  const { personById } = useData();
  const p = personById(id);
  const name = p?.name ?? id;
  return <Avatar name={name} color={p?.color} initials={p?.initials} size={size} />;
}

export function AvatarStack({ ids, size = 22 }: { ids: string[]; size?: number }) {
  if (ids.length === 0)
    return <span className="text-text-tertiary">–</span>;
  return (
    <span className="flex items-center">
      {ids.slice(0, 4).map((id, i) => (
        <span key={id} className={cn(i > 0 && '-ml-1.5')} style={{ zIndex: 10 - i }}>
          <span className="block rounded-full ring-1 ring-bg">
            <PersonAvatar id={id} size={size} />
          </span>
        </span>
      ))}
      {ids.length > 4 && (
        <span className="ml-1 text-[11px] text-text-tertiary">+{ids.length - 4}</span>
      )}
    </span>
  );
}
