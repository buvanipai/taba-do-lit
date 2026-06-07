export default function BgCanvas({ theme }) {
  if (theme !== 'glass') return null;
  return (
    <div className="bg-canvas" aria-hidden="true">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
    </div>
  );
}
