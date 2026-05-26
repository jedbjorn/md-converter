<svelte:head>
	<title>Terms of Service — md-converter</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="legal">
	<header>
		<a href="/" class="back">← Back to app</a>
		<h1>Terms of Service</h1>
		<p class="meta">Effective date: 26 May 2026 · Last reviewed: 26 May 2026</p>
	</header>

	<section>
		<h2>1. Acceptance</h2>
		<p>
			By using <code>md-converter.designs-os.com</code> (the "Service") you agree to
			these Terms of Service. If you do not agree, please do not use the Service. The
			Service is operated by <strong>Designs-OS</strong> ("we", "us").
		</p>
	</section>

	<section>
		<h2>2. Description of the Service</h2>
		<p>
			The Service is a free, browser-based utility that converts Markdown into styled
			HTML using one of several visual themes. All conversion happens locally in your
			browser. No content you supply is transmitted to or stored by us. See the
			<a href="/privacy">Privacy Policy</a> for details.
		</p>
	</section>

	<section>
		<h2>3. Your content</h2>
		<p>
			You retain all rights, title, and interest in the Markdown, configuration, and
			exported HTML you produce with the Service. We claim no licence to your content,
			because we never see it. You are solely responsible for the content you process
			and for ensuring you have the right to do so.
		</p>
	</section>

	<section>
		<h2>4. Acceptable use</h2>
		<p>You agree not to:</p>
		<ul>
			<li>Use the Service in violation of any applicable law or third-party rights.</li>
			<li>Attempt to disrupt, overload, or compromise the Service or its hosting infrastructure.</li>
			<li>Misrepresent the Service or pass off its output as endorsed by us.</li>
		</ul>
	</section>

	<section>
		<h2>5. Availability and changes</h2>
		<p>
			The Service is provided on a best-effort basis. We may modify, suspend, or
			discontinue any part of it at any time, with or without notice. We may also
			update these Terms; the current version is always reachable at
			<code>/terms</code> and material changes will be reflected by updating the
			"Last reviewed" date above. Continued use after a change constitutes acceptance.
		</p>
	</section>

	<section>
		<h2>6. Disclaimer of warranties</h2>
		<p>
			The Service is provided <strong>"as is" and "as available"</strong>, without
			warranty of any kind, express or implied, including but not limited to warranties
			of merchantability, fitness for a particular purpose, accuracy, or
			non-infringement. We do not warrant that the Service will be uninterrupted,
			error-free, or that the output will meet your requirements.
		</p>
	</section>

	<section>
		<h2>7. Limitation of liability</h2>
		<p>
			To the maximum extent permitted by applicable law, in no event shall Designs-OS,
			its maintainers, or its contributors be liable for any indirect, incidental,
			special, consequential, or punitive damages, or for any loss of data, profits, or
			goodwill, arising out of or in connection with your use of the Service. Where
			liability cannot be excluded under mandatory law (including consumer-protection
			law), it is limited to the minimum extent permitted by that law.
		</p>
	</section>

	<section>
		<h2>8. Third-party services</h2>
		<p>
			The Service is delivered via Cloudflare and loads typefaces from Google Fonts.
			Your interaction with those providers is governed by their respective terms and
			privacy policies. We are not responsible for the practices of third-party
			providers; see the <a href="/privacy">Privacy Policy</a> for an overview.
		</p>
	</section>

	<section>
		<h2>9. Governing law and jurisdiction</h2>
		<p>
			These Terms are governed by the laws of <strong>France</strong>, without regard
			to its conflict-of-laws principles. Subject to any mandatory consumer-protection
			rights you have in your country of residence, the courts of <strong>Paris,
			France</strong> shall have exclusive jurisdiction over any dispute arising out of
			or in connection with these Terms or the Service.
		</p>
	</section>

	<section>
		<h2>10. Contact</h2>
		<p>
			Questions about these Terms can be raised via the project issue tracker at
			<a href="https://github.com/jedbjorn/md-converter/issues" rel="noopener">
				github.com/jedbjorn/md-converter/issues</a>.
		</p>
	</section>

	<footer class="legal-footer">
		<a href="/privacy">Privacy Policy</a>
		·
		<a href="/">Back to app</a>
	</footer>
</main>

<style>
	:global(body) {
		background: #fafaf9;
		color: #1a1a1a;
		font-family: ui-serif, Georgia, 'Times New Roman', serif;
	}
	.legal {
		max-width: 68ch;
		margin: 0 auto;
		padding: 4rem 1.5rem 6rem;
		line-height: 1.6;
		font-size: 16px;
	}
	.back {
		display: inline-block;
		margin-bottom: 2rem;
		font: 500 13px ui-sans-serif, system-ui, sans-serif;
		color: #555;
		text-decoration: none;
	}
	.back:hover { color: #000; }
	h1 {
		font-size: 38px;
		font-weight: 600;
		line-height: 1.15;
		margin: 0 0 0.5rem;
		letter-spacing: -0.01em;
	}
	h2 {
		font-size: 22px;
		font-weight: 600;
		margin: 2.5rem 0 0.75rem;
		letter-spacing: -0.01em;
	}
	p, li { margin: 0.6rem 0; }
	ul { padding-left: 1.4rem; }
	code {
		font: 0.9em ui-monospace, SFMono-Regular, Menlo, monospace;
		background: #efeee9;
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}
	a { color: #2a4a8a; text-decoration: underline; text-underline-offset: 2px; }
	a:hover { color: #1a3060; }
	.meta {
		color: #777;
		font: 0.85em ui-sans-serif, system-ui, sans-serif;
		margin: 0 0 1rem;
	}
	.legal-footer {
		margin-top: 4rem;
		padding-top: 1.5rem;
		border-top: 1px solid #ddd;
		color: #777;
		font: 13px ui-sans-serif, system-ui, sans-serif;
		text-align: center;
	}
</style>
