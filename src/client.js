window.__ModuleLoader__.load({
	id: 'dsh-agents-team-next',
	factory(require) {
		const module = { exports: {} };
		const jsxRuntime = require('react/jsx-runtime');
		const React = require('react');
		const ReactDOM = require('react-dom');
		const primitives = require('@deepseek-ai/dsh-client-ui-primitives');
		const { jsx, jsxs } = jsxRuntime;

		const css = '.atn_root{position:relative}.atn_trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:5px;padding:3px 7px;font-size:12px;font-family:inherit;display:inline-flex}.atn_trigger:hover,.atn_trigger:focus-visible{color:var(--dsw-alias-label-primary)}.atn_trigger:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}@container (width<=480px){.atn_triggerLabel{display:none}}.atn_count{color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums;font-size:12px;font-weight:400;line-height:16px}.atn_panel{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);z-index:100;box-sizing:border-box;--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:min(380px,100vw - 32px);max-height:min(560px,100vh - 32px);box-shadow:var(--dsw-elevation-prominent,var(--dsw-elevation-panel));border:0;border-radius:12px;flex-direction:column;padding:8px 2px 0;display:flex;position:fixed;overflow:hidden}.atn_panel:before{content:"";z-index:-1;background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);border-radius:12px;position:absolute;inset:0}.atn_body{--dsh-scrollbar-track-margin:8px;scrollbar-gutter:stable;flex:auto;min-height:0;padding:0 9px 12px 14px;overflow-y:auto}.atn_body h3{color:var(--dsw-alias-label-primary);align-items:center;gap:8px;margin:12px 0 8px 4px;font-size:13px;font-weight:500;display:flex}.atn_list{flex-direction:column;gap:6px;display:flex}.atn_row{--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);min-width:0;box-shadow:var(--dsw-elevation-stroke);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;border:0;border-radius:8px;align-items:flex-start;gap:8px;padding:9px 12px;display:flex;width:100%;font-family:inherit}.atn_row:not(:disabled):hover,.atn_row:not(:disabled):focus-visible{--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);box-shadow:var(--dsw-elevation-panel)}.atn_row:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}.atn_row:disabled{cursor:default;opacity:.55}.atn_rowCurrent{--dsw-elevation-stroke-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 40%,transparent);box-shadow:var(--dsw-elevation-stroke),inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-business-primary) 40%,transparent)}.atn_dot{flex:none;align-items:center;height:1lh;display:inline-flex}.atn_inactiveIcon{color:var(--dsw-alias-label-tertiary)}.atn_rowText{flex-direction:column;gap:2px;min-width:0;display:flex}.atn_rowName{align-items:center;gap:5px;min-width:0;display:inline-flex}.atn_rowNameText{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.atn_currentTag{text-overflow:ellipsis;flex:0 999 auto;min-width:0;padding:0 4px;font-size:10px;line-height:15px;display:inline-block;overflow:hidden}.atn_rowMeta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.atn_rowModel{font-variant-numeric:tabular-nums}.atn_rowEffort{align-items:center;gap:5px;display:flex;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.atn_effort{font-variant-numeric:tabular-nums;border:.5px solid var(--dsw-alias-border-l2);border-radius:5px;padding:0 5px;font-size:10px;line-height:14px;display:inline-block}.atn_effort-low{color:var(--dsw-alias-label-secondary)}.atn_effort-medium{color:var(--dsw-alias-state-business-tertiary);border-color:color-mix(in srgb,var(--dsw-alias-state-business-tertiary) 40%,transparent)}.atn_effort-high{color:var(--dsw-alias-state-business-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 40%,transparent)}.atn_effort-xhigh,.atn_effort-max{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 40%,transparent)}.atn_effort-unknown{color:var(--dsw-alias-label-tertiary)}.atn_rowError{color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.atn_empty{color:var(--dsw-alias-label-tertiary);margin:12px 0 0 4px;font-size:12px}.atn_notice{align-items:center;gap:6px;padding:9px;font-size:12px;display:flex;color:var(--dsw-alias-label-secondary)}.atn_error{align-items:center;gap:6px;padding:9px;font-size:12px;display:flex;color:var(--dsw-alias-state-error-primary);flex-wrap:wrap}.atn_retry{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;align-items:center;gap:4px;padding:2px 4px;font-size:12px;font-family:inherit;display:inline-flex}.atn_retry:hover,.atn_retry:focus-visible{color:var(--dsw-alias-label-primary)}.atn_hint{color:var(--dsw-alias-label-caption);margin:10px 0 2px 4px;font-size:11px;line-height:16px}';
		const cssTagId = 'dsh-agents-team-next/roster.css';
		if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css="${cssTagId}"]`) === null) {
			const tag = document.createElement('style');
			tag.dataset.plugin = 'dsh-agents-team-next';
			tag.dataset.pluginCss = cssTagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		/** Effort ladder, ordered by cost; colors in CSS only encode cost. */
		const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

		/** Effective route of one child session: what ran last, else what will run next. */
		function effectiveRoute(selection) {
			return selection?.lastUsed ?? selection?.next ?? null;
		}

		/** Running flag from the status map, falling back to session summaries. */
		function readRunning(statuses, summaries, id) {
			return (statuses?.get?.(id)?.running ?? summaries?.[id]?.running) === true;
		}

		/**
		 * Normalize both delegation worlds into one roster row list:
		 * `agentTeam` (Agent Teams composed) wins over `subagentCatalog`
		 * (plain subagent). Returns null while neither projection has data.
		 */
		function buildRows(sessionId, values, statuses, summaries) {
			const team = values?.agentTeam;
			if (team !== undefined && Array.isArray(team.members)) {
				return {
					source: 'team',
					failure: typeof team.failure === 'string' ? team.failure : undefined,
					rows: team.members.map((member) => {
						const status = member.phase === 'active'
							? (readRunning(statuses, summaries, member.id) ? 'running' : 'inactive')
							: member.phase;
						return {
							id: member.id,
							label: member.name ?? member.id,
							mode: 'continuable',
							status,
							error: member.error,
							isLead: member.id === sessionId,
						};
					}),
				};
			}
			const catalog = values?.subagentCatalog;
			if (Array.isArray(catalog)) {
				return {
					source: 'catalog',
					rows: catalog.map((entry) => ({
						id: entry.id,
						label: entry.label ?? entry.id,
						mode: entry.mode,
						status: readRunning(statuses, summaries, entry.id) ? 'running' : 'inactive',
						error: undefined,
						isLead: entry.id === sessionId,
					})),
				};
			}
			return null;
		}

		function dotStateOf(status) {
			if (status === 'running' || status === 'provisioning') return 'ongoing';
			if (status === 'failed') return 'error';
			return 'idle';
		}

		/** One roster row. Own component so per-child projection hooks stay stable. */
		function RosterRow({ row, sessionId, useSessions, t, onOpen }) {
			const selection = useSessions((state) => state.projectionsBySession[row.id]?.values.modelSelection);
			const route = effectiveRoute(selection);
			const model = route?.model ?? null;
			const effort = route?.reasoningEffort ?? null;
			const inert = row.isLead || row.status === 'failed' || row.status === 'provisioning';
			return jsx(primitives.Tooltip, {
				label: t('open'),
				side: 'bottom',
				gap: 4,
				disabled: inert,
				children: jsxs('button', {
					type: 'button',
					className: row.isLead ? 'atn_row atn_rowCurrent' : 'atn_row',
					disabled: inert,
					onClick: () => onOpen(row),
					children: [
						jsx('span', {
							className: 'atn_dot',
							children: row.status === 'inactive'
								? jsx(primitives.IconUserOutlineRegular, { size: 14, className: 'atn_inactiveIcon' })
								: jsx(primitives.StateDot, { state: dotStateOf(row.status) }),
						}),
						jsxs('span', {
							className: 'atn_rowText',
							children: [
								jsxs('span', {
									className: 'atn_rowName',
									children: [
										jsx('span', { className: 'atn_rowNameText', children: row.label }),
										row.isLead && jsx(primitives.Tag, {
											tone: 'info',
											className: 'atn_currentTag',
											children: t('current'),
										}),
									],
								}),
								jsxs('small', {
									className: 'atn_rowMeta',
									children: [
										t(`status.${row.status}`),
										model !== null && jsx('span', {
											className: 'atn_rowModel',
											children: ` · ${t('model')}: ${model}`,
										}),
									],
								}),
								jsxs('small', {
									className: 'atn_rowEffort',
									children: [
										jsx('span', { children: t('effort') }),
										effort !== null && EFFORT_LEVELS.includes(effort)
											? jsx('span', { className: `atn_effort atn_effort-${effort}`, children: effort })
											: jsx('span', { className: 'atn_effort atn_effort-unknown', children: '—' }),
									],
								}),
								row.error !== undefined && jsx('small', {
									className: 'atn_rowError',
									children: String(row.error),
								}),
							],
						}),
					],
				}),
			});
		}

		/**
		 * Read-only subagent roster for the composer dock: trigger + portaled
		 * panel listing every direct subagent with its status, actual model,
		 * and actual reasoning effort. Root sessions only — child sessions
		 * keep the official header roster.
		 */
		function SubagentEffortRoster(props) {
			const { sessionId, useSessions, useSessionStatus, openChild, refreshProjection, t } = props;
			if (typeof useSessions !== 'function' || typeof useSessionStatus !== 'function' || typeof sessionId !== 'string') {
				console.error('[dsh-agents-team-next] composer dock standard props missing sessionId/useSessions/useSessionStatus:', Object.keys(props));
				return null;
			}

			const isChild = useSessions((state) => state.byId[sessionId]?.origin === 'subagent');
			const projections = useSessions((state) => state.projectionsBySession);
			const summaries = useSessions((state) => state.byId);
			const statuses = useSessionStatus((value) => value);
			const listing = useSessions((state) => state.phase === 'pending');
			const snapshot = projections[sessionId];
			const built = buildRows(sessionId, snapshot?.values, statuses, summaries);

			const [open, setOpen] = React.useState(false);
			const rootRef = React.useRef(null);
			const triggerRef = React.useRef(null);
			const panelRef = React.useRef(null);
			const position = primitives.useAnchoredPosition({ open, anchorRef: triggerRef, panelRef, gap: 5, margin: 16 });
			primitives.useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef);
			React.useEffect(() => { setOpen(false); }, [sessionId]);
			React.useEffect(() => {
				if (!open) return;
				const dismiss = (event) => {
					if (event.key !== 'Escape') return;
					event.preventDefault();
					setOpen(false);
					if (panelRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
				};
				document.addEventListener('keydown', dismiss);
				return () => { document.removeEventListener('keydown', dismiss); };
			}, [open]);
			React.useLayoutEffect(() => {
				if (open && position !== null) panelRef.current?.focus();
			}, [open, position]);

			if (isChild) return null;

			const rows = built?.rows ?? [];
			const subCount = rows.filter((row) => !row.isLead).length;
			const viewState = built !== null
				? 'ready'
				: snapshot?.state === 'error'
					? 'error'
					: listing || snapshot === undefined || snapshot.state === 'pending'
						? 'loading'
						: 'unavailable';
			const openRow = (row) => {
				setOpen(false);
				openChild({ parentSessionId: sessionId, childSessionId: row.id, mode: row.mode });
			};

			const panelBody = viewState === 'error'
				? jsxs('div', {
					className: 'atn_error',
					role: 'alert',
					children: [
						jsx(primitives.StateDot, { state: 'error' }),
						jsx('span', { children: t('failure', { message: snapshot?.error?.message ?? t('loadError') }) }),
						jsxs('button', {
							type: 'button',
							className: 'atn_retry',
							onClick: () => { refreshProjection(sessionId); },
							children: [jsx(primitives.IconRefreshOutlineRegular, { size: 14 }), t('retry')],
						}),
					],
				})
				: viewState === 'loading'
					? jsxs('div', {
						className: 'atn_notice',
						role: 'status',
						children: [jsx(primitives.StateDot, { state: 'ongoing' }), t('loading')],
					})
					: viewState === 'unavailable'
						? jsxs('div', {
							className: 'atn_notice',
							role: 'status',
							children: [jsx(primitives.StateDot, { state: 'warning' }), t('unavailable')],
						})
						: jsxs(React.Fragment, {
							children: [
								built.failure !== undefined && jsxs('div', {
									className: 'atn_error',
									role: 'alert',
									children: [jsx(primitives.StateDot, { state: 'error' }), t('failure', { message: built.failure })],
								}),
								jsxs('h3', {
									children: [t('roster'), subCount > 0 && jsx('span', { className: 'atn_count', children: String(subCount) })],
								}),
								jsxs('div', {
									className: 'atn_list',
									children: rows.map((row) => jsx(RosterRow, {
										row,
										sessionId,
										useSessions,
										t,
										onOpen: openRow,
									}, row.id)),
								}),
								subCount === 0 && jsx('p', { className: 'atn_empty', children: t('empty') }),
								jsx('p', { className: 'atn_hint', children: t('hint') }),
							],
						});

			return jsxs('div', {
				ref: rootRef,
				className: 'atn_root',
				'data-agents-team-next': true,
				children: [
					jsxs('button', {
						type: 'button',
						ref: triggerRef,
						className: 'atn_trigger',
						'aria-label': t('trigger'),
						'aria-haspopup': 'dialog',
						'aria-expanded': open,
						onClick: () => { setOpen((current) => !current); },
						children: [
							jsx(primitives.IconUsersOutlineRegular, { size: 14 }),
							jsx('span', { className: 'atn_triggerLabel', children: t('trigger') }),
							viewState === 'ready' && subCount > 0 && jsx('span', {
								className: 'atn_count',
								children: String(subCount),
							}),
						],
					}),
					open && ReactDOM.createPortal(jsxs('div', {
						ref: panelRef,
						className: 'atn_panel',
						role: 'dialog',
						tabIndex: -1,
						'aria-label': t('trigger'),
						'data-agents-team-next-panel': true,
						style: position ?? { visibility: 'hidden', left: 0, top: 0 },
						children: [jsx('div', { className: 'atn_body', children: panelBody })],
					}), document.body),
				],
			});
		}

		/** Locale namespace owned by this plugin. */
		const NS = 'agents-team-next';
		const zh = {
			trigger: '子代理',
			loading: '正在读取子代理名册…',
			unavailable: '当前会话未启用 subagent / Agent Team，没有子代理名册',
			empty: '当前会话还没有子代理',
			roster: '子代理名册',
			model: '模型',
			effort: '思考强度',
			current: '当前会话',
			open: '打开子会话',
			retry: '重试',
			loadError: '读取失败',
			failure: '名册读取失败：{message}',
			hint: '档位由模型逐任务显式选择。本名册只读，不提供改档。',
			'status.running': '运行中',
			'status.inactive': '未运行',
			'status.provisioning': '准备中',
			'status.failed': '创建失败',
		};
		const en = {
			trigger: 'Subagents',
			loading: 'Loading the subagent roster…',
			unavailable: 'No subagent / Agent Team roster for this session',
			empty: 'No subagents yet for this session',
			roster: 'Subagent roster',
			model: 'Model',
			effort: 'Effort',
			current: 'Current chat',
			open: 'Open subagent session',
			retry: 'Retry',
			loadError: 'Load failed',
			failure: 'Roster failed: {message}',
			hint: 'Efforts are chosen explicitly per task by the model. This roster is read-only.',
			'status.running': 'Running',
			'status.inactive': 'Inactive',
			'status.provisioning': 'Provisioning',
			'status.failed': 'Failed',
		};

		/** Required browser services for navigation, slots, sessions, and copy. */
		const inject = ['sessions', 'uiWorkspace', 'slots', 'locale'];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-agents-team-next: dictionaries');
			const sessions = ctx.sessions;
			const actions = {
				openChild(address) {
					try {
						if (address === null || typeof address !== 'object') return;
						const { parentSessionId, childSessionId, mode } = address;
						if (typeof parentSessionId !== 'string' || typeof childSessionId !== 'string') return;
						if ((sessions.retainInfo(parentSessionId).getSnapshot().retainedBy.mainView ?? 0) === 0) return;
						if (childSessionId === parentSessionId) {
							ctx.uiWorkspace.openSession(parentSessionId);
							return;
						}
						ctx.uiWorkspace.openSession({ parentSessionId, childSessionId, mode: mode ?? 'continuable' });
					} catch (error) {
						console.error('[dsh-agents-team-next] openSession failed:', error);
					}
				},
				refreshProjection(sessionId) {
					try { sessions.refreshProjections(sessionId); } catch { /* best-effort refresh */ }
				},
			};
			ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
				name: 'conversation.composer.dock',
				id: 'agents-team-next-roster',
				order: 26,
				locale: NS,
				inject: () => actions,
			}, SubagentEffortRoster));
		}

		module.exports.apply = apply;
		module.exports.inject = inject;
		return module.exports;
	},
});
