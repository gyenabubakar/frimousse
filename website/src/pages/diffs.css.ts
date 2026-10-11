import { diffsStylesheet } from '$lib/diffs';

// The shared @pierre/diffs stylesheet that every code block links to (see src/lib/diffs.ts).
export async function GET() {
  return new Response(await diffsStylesheet(), { headers: { 'Content-Type': 'text/css' } });
}
