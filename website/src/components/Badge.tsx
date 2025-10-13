export default function Badge({
  type = 'tip',
  children = '',
}: {
  type: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <span className={`badge ${type}`}>{children}</span>
  );
}
