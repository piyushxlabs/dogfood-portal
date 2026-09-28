// app/api-docs/page.tsx
// Interactive OpenAPI 3.0 Documentation Explorer (Zero CDN, Air-Gapped)
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS)

import React from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { BookOpen, Code2, ShieldAlert, CheckCircle, ExternalLink, Terminal, Layers } from 'lucide-react';
import Link from 'next/link';

interface OpenApiDoc {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  tags: { name: string; description: string }[];
  paths: Record<string, Record<string, any>>;
}

async function getOpenApiSpec(): Promise<OpenApiDoc> {
  try {
    const filePath = path.resolve(process.cwd(), 'docs', 'openapi.json');
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[API-DOCS] Failed to load openapi.json, using fallback stub:', err);
    return {
      openapi: '3.0.3',
      info: {
        title: 'Dogfood 2026 Hackathon Portal API',
        version: '1.0.0',
        description: 'Air-gapped OpenAPI specification. Spec file temporarily unavailable — container may still be initializing.',
      },
      tags: [],
      paths: {},
    };
  }
}

export const metadata = {
  title: 'API Documentation | Dogfood 2026',
  description: 'Interactive OpenAPI 3.0 Platform API specification for Dogfood 2026.',
};

export default async function ApiDocsPage() {
  const spec = await getOpenApiSpec();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 pb-8 border-b border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Code2 className="w-3.5 h-3.5" />
              <span>OpenAPI 3.0.3 Specification</span>
            </div>
            <a
              href="/docs/openapi.json"
              download="openapi.json"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Download raw openapi.json</span>
            </a>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            {spec.info.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed mb-6">
            {spec.info.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
              Version: <strong className="text-zinc-200">{spec.info.version}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
              Base URL: <strong className="text-zinc-200">http://localhost:8080</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              Air-Gapped: Zero External CDN Dependencies
            </span>
          </div>
        </header>

        {/* API Authentication & Roles Notice */}
        <div className="mb-10 p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl backdrop-blur-md">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Authentication & Role-Isolation Matrix</span>
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Protected endpoints accept authentication credentials via either <code>Cookie: session=&lt;token&gt;</code> or <code>Authorization: Bearer &lt;token&gt;</code>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div className="text-zinc-500 text-[10px]">ORGANIZER</div>
              <div className="text-indigo-400 font-semibold mt-0.5">org_7f2a</div>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div className="text-zinc-500 text-[10px]">JUDGE A</div>
              <div className="text-purple-400 font-semibold mt-0.5">jdg_a_91bc</div>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div className="text-zinc-500 text-[10px]">JUDGE B</div>
              <div className="text-purple-400 font-semibold mt-0.5">jdg_b_44de</div>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div className="text-zinc-500 text-[10px]">PARTICIPANT</div>
              <div className="text-emerald-400 font-semibold mt-0.5">prt_2e88</div>
            </div>
          </div>
        </div>

        {/* Endpoints Catalog */}
        <div className="space-y-6">
          {Object.entries(spec.paths).map(([endpointPath, methods]) => {
            return Object.entries(methods).map(([httpMethod, details]: [string, any]) => {
              const methodUpper = httpMethod.toUpperCase();
              const isGet = methodUpper === 'GET';
              const isPost = methodUpper === 'POST';

              const methodColor = isGet
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : isPost
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

              return (
                <div
                  key={`${endpointPath}-${httpMethod}`}
                  className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${methodColor}`}
                      >
                        {methodUpper}
                      </span>
                      <span className="font-mono text-sm sm:text-base font-semibold text-zinc-100">
                        {endpointPath}
                      </span>
                    </div>

                    {details.tags && (
                      <div className="flex items-center gap-1.5">
                        {details.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 mb-4">{details.summary}</p>
                  {details.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {details.description}
                    </p>
                  )}

                  {/* Query / Path Parameters */}
                  {details.parameters && details.parameters.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
                        Parameters
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-zinc-300">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500 font-mono">
                              <th className="pb-1.5 font-normal">Name</th>
                              <th className="pb-1.5 font-normal">In</th>
                              <th className="pb-1.5 font-normal">Required</th>
                              <th className="pb-1.5 font-normal">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/60 font-mono">
                            {details.parameters.map((p: any) => (
                              <tr key={p.name}>
                                <td className="py-2 text-indigo-400 font-semibold">{p.name}</td>
                                <td className="py-2 text-zinc-400">{p.in}</td>
                                <td className="py-2">
                                  {p.required ? (
                                    <span className="text-rose-400 font-bold">Yes</span>
                                  ) : (
                                    <span className="text-zinc-500">No</span>
                                  )}
                                </td>
                                <td className="py-2 text-zinc-300 font-sans">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Example curl Command */}
                  <div className="mt-4 pt-4 border-t border-zinc-800/80">
                    <div className="text-[11px] font-mono text-zinc-500 mb-1.5 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Example cURL Request:</span>
                    </div>
                    <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/90 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre">
                      {isGet
                        ? `curl -s "http://localhost:8080${endpointPath}"${
                            details.security ? ' -H "Cookie: session=org_7f2a"' : ''
                          }`
                        : `curl -s -X POST "http://localhost:8080${endpointPath}" -H "Content-Type: application/json"${
                            details.security ? ' -H "Cookie: session=org_7f2a"' : ''
                          } -d '{"example":"payload"}'`}
                    </pre>
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
