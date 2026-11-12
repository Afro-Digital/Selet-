import { APP_NAME } from '@selet/shared';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50 text-slate-900">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{APP_NAME} (ስሌት)</h1>
        <p className="text-lg text-slate-600 mb-6">
          Defensible cost estimation and profitable pricing for software companies in Ethiopia.
        </p>
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm text-sm text-slate-500">
          Stage 1 Foundation Active &bull; Next.js 15 App Router + NestJS API
        </div>
      </div>
    </main>
  );
}
