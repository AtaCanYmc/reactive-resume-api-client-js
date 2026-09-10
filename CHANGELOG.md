# Changelog

## [1.1.0](https://github.com/AtaCanYmc/reactive-resume-api-client-js/compare/v1.0.1...v1.1.0) (2026-09-10)


### Features

* **demo:** add AI Providers, AI & Agent Studio, and Auth tabs showcasing full SDK capabilities ([f10abc7](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/f10abc79d4a6908bfd3ea8935ca66cf86d7230df))
* **demo:** add direct Get API Key link pointing to instance settings ([2c95c63](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/2c95c63d9ce8270907ab8d67fbf97192ae07ec0c))
* **demo:** add multi-language support (EN, TR, DE, FR, ES) to settings modal ([c0783c3](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/c0783c380c05d8082bc2b074ea940910b9cad9c6))
* **demo:** add settings modal with theme switcher (light/dark/system) ([0f703ff](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/0f703ff5c2c4640dce1ef7daa3adc5b2fdb03199))
* **demo:** add standalone demo backend with OpenAPI mock, CORS, and proxy ([6e3449b](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/6e3449b51bfe153babbf47e8853096eb2abfc32a))
* **demo:** add Test Connection button and live instance link next to API Base URL ([3298dfa](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/3298dfa916e8a84a458a9afbd277d19a504a8427))
* **demo:** connect web demo with demo backend and add target presets ([8ea43de](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/8ea43deebdab3aaee4673297b2a8c00d7df88785))
* **demo:** persist API key, base URL, and sandbox state across sessions ([461862c](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/461862c77ebc1024a70706317986e776d3ab6927))
* **docker:** add multi-stage Dockerfile and docker-compose for unified demo ([82bf43e](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/82bf43e33566d603d65aa9d3d0dc2317ca3da665))
* **docker:** add WEB_PORT environment variable and expose port 3001 in docker-compose ([4ffe62c](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/4ffe62c459f3f64ca033869b5ca8e052880ca2fc))
* **makefile:** add Docker commands for managing demo container ([29d645f](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/29d645f9b97d7bf6ea61333840f434454d0a613e))
* **server:** refactor backend to use Express, add API routes and health check ([3ca182f](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/3ca182fc15390101ece0fd27b2c4f19eac1e47da))


### Bug Fixes

* **demo:** enable dual-stack IPv4/IPv6 listen and add 127.0.0.1 fallback for Safari ([225d2c2](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/225d2c23864467e262b2df33522bd697a61475ba))
* **demo:** fix language and theme switching by removing pointer-events none and adding direct option click handling ([23faf51](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/23faf514050ea239889985efbd2bfd30b5547c5a))
* **demo:** resolve sourcemap 404 and enable cors proxy for live data fetching ([735e842](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/735e8429f4836c245a8671dc0b1457f5597c45c5))
* **demo:** universal multi-port CORS proxy routing and in-app diagnostics ([694915e](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/694915e25f58d597f323e0829c3f1d9a0f1ddfd5))
* **i18n:** make all static UI strings dynamic across all 5 languages ([10781cd](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/10781cde5822f541b0c345ad30ac945155f9884c))
* **server:** auto-redirect browser navigations from /proxy to root demo ([cdeca3b](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/cdeca3b2a8805825868086ee5404eb780e508ceb))

## [1.0.1](https://github.com/AtaCanYmc/reactive-resume-api-client-js/compare/v1.0.0...v1.0.1) (2026-09-10)


### Bug Fixes

* **client:** enforce Node &gt;=20.12 engine requirement and enhance demo workbench ([757bd63](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/757bd63091afe06ba1f6b0f1c4f92c1e87f71bea))

## 1.0.0 (2026-09-10)


### Features

* add CI pipeline, Dependabot configuration, and PR title validation ([247cf08](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/247cf08ca6d90f1e7ccbd3ec6f7a0e478f09792f))
* add core API modules and TypeScript definitions for Reactive Resume v4 ([976d447](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/976d447904705a4838c0c11ba182782bbd08b6ae))
* add interactive web demo with build and preview scripts, and mock data for resumes and applications ([69ef185](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/69ef185a10230a031dc0b0030913aa0c8211ea32))
* add Makefile for build and development commands, update TypeScript and Vitest dependencies ([4271d29](https://github.com/AtaCanYmc/reactive-resume-api-client-js/commit/4271d29c23cecdf51b713d51e7f11e19657dc4d7))
