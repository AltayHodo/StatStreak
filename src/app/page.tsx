import GameBoardWrapper from './components/GameBoardWrapper';

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-daily-game`,
    {
      cache: 'no-store',
    }
  );
  const { game } = await res.json();

  return (
    <div>
      <GameBoardWrapper game={game} />
    </div>
  );
}
