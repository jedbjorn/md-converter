<script>
	import '$lib/styles/legal.css';
</script>

<svelte:head>
	<title>Privacy Policy — md-converter</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="legal">
	<header>
		<a href="/" class="back">← Back to app</a>
		<h1>Privacy Policy</h1>
		<p class="meta">Effective date: 26 May 2026 · Last reviewed: 11 November 2026</p>
	</header>

	<section>
		<h2>1. Operator</h2>
		<p>
			This site (<code>md-converter.designs-os.com</code>) is operated by
			<strong>Designs-OS</strong> ("we", "us"). Privacy queries and requests
			can be sent via the project issue tracker at
			<a href="https://github.com/jedbjorn/md-converter/issues" rel="noopener">
				github.com/jedbjorn/md-converter/issues</a>.
		</p>
	</section>

	<section>
		<h2>2. Summary</h2>
		<p>
			This is a client-side tool. The Markdown files you load, the HTML you export,
			and any style overrides you make are processed entirely inside your browser and
			are <strong>never transmitted to us</strong>. We operate no backend, no database,
			no user accounts, and no analytics.
		</p>
	</section>

	<section>
		<h2>3. What is processed, and why</h2>

		<h3>3.1 Files and content you provide</h3>
		<p>
			Markdown you paste, upload, or import; theme tokens and font choices; configuration
			JSON you import or export. All of this is handled locally in your browser. None of
			it reaches our infrastructure.
		</p>

		<h3>3.2 Browser storage (<code>localStorage</code>)</h3>
		<p>
			We persist a single key, <code>md-converter-config-v1</code>, in your browser's
			<code>localStorage</code>. It holds the active theme and your colour/font overrides
			so that they survive a page refresh. No personal data, no identifier, no tracking
			value. You can delete it at any time via your browser's site-data controls.
		</p>

		<h3>3.3 Hosting and access logs (Cloudflare)</h3>
		<p>
			The site is served by Cloudflare. When your browser requests a page, Cloudflare
			receives standard HTTP metadata including your IP address, user-agent, and the
			URL you requested. Cloudflare processes this on our behalf to deliver content,
			secure the service against abuse, and provide aggregate operational metrics.
			Cloudflare's processing is governed by its
			<a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">Privacy Policy</a>
			and
			<a href="https://www.cloudflare.com/cloudflare-customer-dpa/" rel="noopener">Data Processing Addendum</a>.
		</p>

		<h3>3.4 Third-party fonts (Google Fonts)</h3>
		<p>
			Several themes load typefaces from Google Fonts (<code>fonts.googleapis.com</code>,
			<code>fonts.gstatic.com</code>). Loading these files causes your browser to send
			your IP address and user-agent to Google LLC (United States), as covered by
			<a href="https://policies.google.com/privacy" rel="noopener">Google's Privacy Policy</a>.
			If you would prefer not to load fonts from Google, your browser
			or a browser extension can block requests to those domains; the app remains
			functional, with system fonts as the fallback.
		</p>
	</section>

	<section>
		<h2>4. What is not processed</h2>
		<ul>
			<li>No analytics, telemetry, or pixels.</li>
			<li>No advertising or third-party tracking cookies.</li>
			<li>No user accounts, no authentication.</li>
			<li>No automated decision-making or profiling.</li>
			<li>No data is sold or shared with marketing partners.</li>
		</ul>
	</section>

	<section>
		<h2>5. International transfers</h2>
		<p>
			Cloudflare and Google may process traffic on infrastructure located in other
			countries, including the United States.
		</p>
	</section>

	<section>
		<h2>6. Retention</h2>
		<p>
			We retain no personal data ourselves. Cloudflare retains access logs in line with
			its own policy (typically a short rolling window for operational and security
			purposes). The <code>localStorage</code> entry remains on your device until you
			clear it.
		</p>
	</section>

	<section>
		<h2>7. Your rights</h2>
		<p>
			Where Designs-OS holds personal data about you, you have the right to: access,
			rectify, erase, restrict processing of, port, and object to the processing of,
			your personal data. As we hold no personal data about you ourselves, in practice
			these rights are exercised against the providers named above (Cloudflare, Google)
			under their own policies.
		</p>
	</section>

	<section>
		<h2>8. Children</h2>
		<p>
			The service is not directed at children under 16 and we do not knowingly process
			data about them.
		</p>
	</section>

	<section>
		<h2>9. Changes to this policy</h2>
		<p>
			Material changes will be reflected by updating the "Last reviewed" date at the top
			of this page. The full revision history is visible in the
			<a href="https://github.com/jedbjorn/md-converter/commits/main/src/routes/privacy/+page.svelte" rel="noopener">
				project's public Git history</a>.
		</p>
	</section>

	<footer class="legal-footer">
		<a href="/terms">Terms of Service</a>
		·
		<a href="/">Back to app</a>
		·
		<a href="https://designs-os.com/">Designs/OS</a>
	</footer>
</main>
