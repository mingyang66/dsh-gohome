window.__ModuleLoader__.load({
  id: 'dsh-gohome',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-gohome';
    const STORAGE_KEY = 'dsh-gohome:work-hours';
    const LEGACY_STORAGE_KEY = 'dsh-timer:work-hours';
    const DEFAULT_HOURS = { start: '09:00', end: '18:00', remindMinutes: 30 };
    const LAST_CALL_SECONDS = 30 * 60;
    const FINAL_CALL_SECONDS = 5 * 60;
    const REMIND_MAX_MINUTES = 120;
    const FLASH_MS = 6000;
    const BRAND = 'var(--dsw-alias-brand-primary)';
    const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

    const DICTS = {
      en: {
        untilOffWork: 'Until off work',
        untilWork: 'Until work starts',
        overtime: 'Overtime',
        endNow: 'Time to go',
        lastCall: 'Wrapping up',
        weekend: 'Weekend',
        nextWorkday: 'Mon',
        progress: 'Progress',
        remind: 'Remind ahead',
        minutes: 'min',
        remindError: 'Reminder must be 0-120 minutes',
        weekdays: 'Workday',
        startLabel: 'Start',
        endLabel: 'End',
        save: 'Save',
        cancel: 'Cancel',
        rangeError: 'End must be later than start',
        emptyError: 'Fill in both times first',
        saveFailed: 'Could not write browser storage; this session only',
        editHint: 'Click to edit work hours',
        nav: 'Timer settings',
        settingsDesc: 'Countdown and reports use these hours. Changes apply immediately and are stored in this browser.',
        resetButton: 'Reset to defaults',
        saved: 'Saved',
        reset: 'Defaults restored',
        now: 'Now',
        storageNote: 'Stored in this browser only; another browser starts from 09:00-18:00.',
      },
      zh: {
        untilOffWork: '距离下班',
        untilWork: '距离上班',
        overtime: '加班',
        endNow: '该下班了',
        lastCall: '即将下班',
        weekend: '周末休息',
        nextWorkday: '周一',
        progress: '进度',
        remind: '提前提醒',
        minutes: '分钟',
        remindError: '提醒需在 0-120 分钟之间',
        weekdays: '工作日',
        startLabel: '上班',
        endLabel: '下班',
        save: '保存',
        cancel: '取消',
        rangeError: '结束时间需晚于开始时间',
        emptyError: '请先填写上下班时间',
        saveFailed: '未能写入浏览器存储，仅本次有效',
        editHint: '点击修改上下班时间',
        nav: '计时配置',
        settingsDesc: '倒计时与播报都按这里的上下班时间计算。保存后立即生效，设置保存在本浏览器。',
        resetButton: '恢复默认',
        saved: '已保存',
        reset: '已恢复默认',
        now: '当前',
        storageNote: '仅保存在本浏览器；换浏览器会从默认的 09:00-18:00 开始。',
      },
    };

    /** English is the baseline vocabulary, so a missing locale service stays readable. */
    const FALLBACK = DICTS.en;

    const CSS = [
      '.dsh-gohome{display:flex;align-items:center;gap:8px;padding:1px 4px;min-width:0;order:9999;',
      'font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);',
      'line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px));',
      'color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));',
      'font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden}',
      '.dsh-gohome__row{display:flex;align-items:center;gap:6px;min-width:0;padding:0;border:0;',
      'background:none;font:inherit;color:inherit;cursor:pointer;border-radius:4px}',
      '.dsh-gohome__row:hover .dsh-gohome__label{color:var(--dsw-alias-label-primary)}',
      '.dsh-gohome__label{flex:0 0 auto;overflow:hidden;text-overflow:ellipsis}',
      '.dsh-gohome__value{flex:0 0 auto;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.dsh-gohome__meter{flex:0 1 72px;min-width:32px;height:4px;border-radius:999px;overflow:hidden;margin-left:6px;',
      'background:var(--dsw-alias-border-l3,var(--dsw-alias-border-l1))}',
      '.dsh-gohome__fill{display:block;height:100%;border-radius:999px;transition:width .4s linear}',
      '.dsh-gohome__pct{flex:0 0 auto;margin-left:2px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.dsh-gohome__time{box-sizing:border-box;width:80px;height:24px;padding:0 4px;border-radius:6px;',
      'border:1px solid var(--dsw-alias-border-l4,var(--dsw-alias-border-l1));background:transparent;',
      'color:var(--dsw-alias-label-primary);font:inherit}',
      '.dsh-gohome__btn{box-sizing:border-box;height:24px;padding:0 8px;border-radius:6px;font:inherit;',
      'cursor:pointer;border:1px solid var(--dsw-alias-border-l4,var(--dsw-alias-border-l1));',
      'background:transparent;color:var(--dsw-alias-label-primary)}',
      '.dsh-gohome__btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.dsh-gohome__error{flex:0 0 auto;color:var(--dsw-alias-state-error-primary)}',
      '.dsh-gohome__edit{flex:0 0 auto;display:flex;align-items:center;opacity:.55}',
      '.dsh-gohome--flash .dsh-gohome__value{animation:dsh-gohome-pulse .7s ease-in-out 5}',
      '@keyframes dsh-gohome-pulse{0%,100%{opacity:1}50%{opacity:.3}}',
      '@media (prefers-reduced-motion:reduce){.dsh-gohome--flash .dsh-gohome__value{animation:none;text-decoration:underline}}',
      '.dsh-gohome__row:hover .dsh-gohome__edit,.dsh-gohome__row:focus-visible .dsh-gohome__edit{opacity:1}',
      '.dsh-gohome__row:focus-visible,.dsh-gohome__time:focus-visible,.dsh-gohome__btn:focus-visible{',
      'outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '@media (max-width:640px){.dsh-gohome__pct{display:none}}',
      '@media (max-width:480px){.dsh-gohome__meter{display:none}}',
      '.dsh-gohome-page{display:flex;flex-direction:column;gap:12px;max-width:560px;padding:4px 0 16px;',
      'font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.dsh-gohome-page__title{margin:0;font-size:16px;line-height:24px;font-weight:500;',
      'color:var(--dsw-alias-label-primary)}',
      '.dsh-gohome-page__desc{margin:0}',
      '.dsh-gohome-page__row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
      '.dsh-gohome-page__label{flex:0 1 84px;min-width:56px;color:var(--dsw-alias-label-secondary)}',
      '.dsh-gohome-page__input{box-sizing:border-box;flex:0 0 auto;width:128px;max-width:100%;height:32px;',
      'padding:0 8px;border-radius:var(--dsw-radius-sm,8px);',
      'border:0.5px solid var(--dsw-alias-border-l4,var(--dsw-alias-border-l1));',
      'background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit}',
      '.dsh-gohome-page__input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-gohome-page__actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.dsh-gohome-page__btn{box-sizing:border-box;height:32px;padding:0 14px;font:inherit;cursor:pointer;',
      'border-radius:var(--dsw-radius-sm,8px);background:transparent;',
      'border:0.5px solid var(--dsw-alias-border-l4,var(--dsw-alias-border-l1));',
      'color:var(--dsw-alias-label-primary)}',
      '.dsh-gohome-page__btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.dsh-gohome-page__btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.dsh-gohome-page__btn:disabled{opacity:.4;cursor:default}',
      '.dsh-gohome-page__btn--primary{border-color:transparent;',
      'background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));',
      'color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base))}',
      '.dsh-gohome-page__btn--primary:hover{',
      'background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-brand-primary))}',
      '.dsh-gohome-page__feedback{font-size:12px;color:var(--dsw-alias-state-success-primary)}',
      '.dsh-gohome-page__error{font-size:12px;color:var(--dsw-alias-state-error-primary)}',
      '.dsh-gohome-page__hint{font-size:12px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.dsh-gohome-page__now{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
    ].join('');

    function pad2(value) {
      return value < 10 ? '0' + value : String(value);
    }

    function formatClock(totalSeconds) {
      const seconds = Math.max(0, Math.floor(totalSeconds));
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return pad2(hours) + ':' + pad2(minutes) + ':' + pad2(seconds % 60);
    }

    function toMinutes(hhmm) {
      const text = String(hhmm || '');
      if (!TIME_PATTERN.test(text)) return NaN;
      const parts = text.split(':');
      return Number(parts[0]) * 60 + Number(parts[1]);
    }

    function isValidRange(start, end) {
      const from = toMinutes(start);
      const to = toMinutes(end);
      return Number.isFinite(from) && Number.isFinite(to) && from < to;
    }

    function isEmptyValue(value) {
      return !String(value || '').trim();
    }

    /** Reminder minutes arrive as strings from number inputs and as absent from older records. */
    function normalizeRemind(value) {
      const minutes = Math.round(Number(value));
      if (!Number.isFinite(minutes) || minutes < 0 || minutes > REMIND_MAX_MINUTES) {
        return DEFAULT_HOURS.remindMinutes;
      }
      return minutes;
    }

    function readHours() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
          || window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!raw) return { ...DEFAULT_HOURS };
        const parsed = JSON.parse(raw);
        if (parsed && isValidRange(parsed.start, parsed.end)) {
          const hours = {
            start: parsed.start,
            end: parsed.end,
            remindMinutes: normalizeRemind(parsed.remindMinutes),
          };
          // Carry a setting saved under the plugin's former name across the rename.
          if (!window.localStorage.getItem(STORAGE_KEY)) writeHours(hours);
          return hours;
        }
      } catch (error) {
        // Unreadable storage keeps the defaults; the row must still render.
      }
      return { ...DEFAULT_HOURS };
    }

    /** @returns {boolean} whether the value reached browser storage. */
    function writeHours(hours) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hours));
        return true;
      } catch (error) {
        return false;
      }
    }

    /** One shared copy so two mounted composers and the settings page agree. */
    const listeners = new Set();
    let sharedHours = null;

    function getHours() {
      if (!sharedHours) sharedHours = readHours();
      return sharedHours;
    }

    function setHours(next) {
      sharedHours = next;
      const persisted = writeHours(next);
      listeners.forEach(function (notify) { notify(next); });
      return persisted;
    }

    function subscribeHours(notify) {
      listeners.add(notify);
      return function () { listeners.delete(notify); };
    }

    function reloadFromStorage() {
      sharedHours = readHours();
      listeners.forEach(function (notify) { notify(sharedHours); });
    }

    function useHours() {
      const [hours, setLocal] = React.useState(getHours);
      React.useEffect(function () {
        return subscribeHours(function (next) { setLocal(next); });
      }, []);
      return hours;
    }

    function useNow(intervalMs) {
      const [now, setNow] = React.useState(function () { return Date.now(); });
      React.useEffect(function () {
        const id = window.setInterval(function () { setNow(Date.now()); }, intervalMs);
        return function () { window.clearInterval(id); };
      }, [intervalMs]);
      return now;
    }

    function useLocaleRevision(locale) {
      const [revision, setRevision] = React.useState(0);
      React.useEffect(function () {
        if (!locale || typeof locale.subscribe !== 'function') return undefined;
        return locale.subscribe(function () {
          setRevision(function (count) { return count + 1; });
        });
      }, [locale]);
      return revision;
    }

    /** Shared clock math: the dock row and the settings preview must never disagree. */
    function computeState(hours, now, t) {
      const date = new Date(now);
      const weekday = date.getDay();
      const secondOfDay = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      const startSeconds = toMinutes(hours.start) * 60;
      const endSeconds = toMinutes(hours.end) * 60;
      const workSeconds = Math.max(60, endSeconds - startSeconds);

      if (weekday === 0 || weekday === 6) {
        return {
          stage: 'weekend', remaining: 0,
          label: t('weekend'),
          value: t('nextWorkday') + ' ' + hours.start,
          percent: 0, tone: BRAND, showMeter: false,
        };
      }
      if (secondOfDay < startSeconds) {
        return {
          stage: 'before', remaining: startSeconds - secondOfDay,
          label: t('untilWork'),
          value: formatClock(startSeconds - secondOfDay),
          percent: 0, tone: BRAND, showMeter: false,
        };
      }
      if (secondOfDay >= endSeconds) {
        const elapsed = secondOfDay - endSeconds;
        return {
          stage: 'overtime', remaining: 0,
          label: elapsed < 60 ? t('endNow') : t('overtime'),
          value: '+' + formatClock(elapsed),
          percent: 100, tone: BRAND, showMeter: false,
        };
      }
      const remaining = endSeconds - secondOfDay;
      const ratio = (secondOfDay - startSeconds) / workSeconds;
      return {
        stage: 'work', remaining,
        label: remaining <= LAST_CALL_SECONDS ? t('lastCall') : t('untilOffWork'),
        value: formatClock(remaining),
        percent: Math.min(99, Math.max(0, Math.floor(ratio * 100))),
        tone: remaining <= LAST_CALL_SECONDS ? 'var(--dsw-alias-state-warn-primary)' : BRAND,
        showMeter: true,
      };
    }

    function EditGlyph() {
      return h('svg', {
        width: 10, height: 10, viewBox: '0 0 10 10', 'aria-hidden': true,
        style: { display: 'block' },
      },
        h('path', {
          d: 'M1.2 8.8h7.6', fill: 'none',
          stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M2.1 6.4 6.6 1.9l1.5 1.5L3.6 7.9l-1.9.4z', fill: 'none',
          stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round',
        }),
      );
    }

    function Countdown(props) {
      const t = props.t;
      const hours = useHours();
      const now = useNow(1000);
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState(hours);
      const [error, setError] = React.useState('');
      const [flashUntil, setFlashUntil] = React.useState(0);
      const previous = React.useRef(null);

      const windowText = hours.start + '-' + hours.end;
      const state = computeState(hours, now, t);
      const flashing = flashUntil > now;

      // Pulse once when a reminder threshold is crossed, and once when the end time passes.
      React.useEffect(function () {
        const prior = previous.current;
        previous.current = { stage: state.stage, remaining: state.remaining };
        if (!prior) return;
        let fired = false;
        if (prior.stage === 'work' && state.stage === 'work') {
          const marks = [hours.remindMinutes * 60, FINAL_CALL_SECONDS];
          for (const mark of marks) {
            if (mark > 0 && prior.remaining > mark && state.remaining <= mark) {
              fired = true;
              break;
            }
          }
        }
        if (prior.stage !== 'overtime' && state.stage === 'overtime') fired = true;
        if (fired) setFlashUntil(Date.now() + FLASH_MS);
      }, [state.stage, state.remaining, hours.remindMinutes]);

      // Follow a change made elsewhere while this row sits in edit mode with a clean draft.
      React.useEffect(function () {
        setDraft(function (current) {
          if (!editing) return current;
          const dirty = current.start !== hours.start || current.end !== hours.end;
          return dirty ? current : hours;
        });
      }, [hours, editing]);

      function beginEdit() {
        setDraft(hours);
        setError('');
        setEditing(true);
      }

      function commit() {
        if (isEmptyValue(draft.start) || isEmptyValue(draft.end)) {
          setError(t('emptyError'));
          return;
        }
        if (!isValidRange(draft.start, draft.end)) {
          setError(t('rangeError'));
          return;
        }
        setHours({ start: draft.start, end: draft.end, remindMinutes: hours.remindMinutes });
        setEditing(false);
      }

      function cancel() {
        setError('');
        setEditing(false);
      }

      function onFormKeyDown(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          cancel();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          commit();
        }
      }

      function updateDraft(field) {
        return function (event) {
          const next = { ...draft, [field]: event.target.value };
          setDraft(next);
          if (error) setError('');
        };
      }

      if (editing) {
        return h(React.Fragment, null,
          h('style', null, CSS),
          h('div', { className: 'dsh-gohome', onKeyDown: onFormKeyDown },
            h('span', { className: 'dsh-gohome__label' }, t('startLabel')),
            h('input', {
              className: 'dsh-gohome__time',
              type: 'time',
              value: draft.start,
              'aria-label': t('startLabel'),
              'aria-invalid': error ? true : undefined,
              onChange: updateDraft('start'),
            }),
            h('span', { className: 'dsh-gohome__label' }, t('endLabel')),
            h('input', {
              className: 'dsh-gohome__time',
              type: 'time',
              value: draft.end,
              'aria-label': t('endLabel'),
              'aria-invalid': error ? true : undefined,
              onChange: updateDraft('end'),
            }),
            h('button', { type: 'button', className: 'dsh-gohome__btn', onClick: commit }, t('save')),
            h('button', { type: 'button', className: 'dsh-gohome__btn', onClick: cancel }, t('cancel')),
            error ? h('span', { className: 'dsh-gohome__error', role: 'alert' }, error) : null,
          ),
        );
      }

      return h(React.Fragment, null,
        h('style', null, CSS),
        h('div', { className: 'dsh-gohome' + (flashing ? ' dsh-gohome--flash' : '') },
          h('div', {
            className: 'dsh-gohome__row',
            role: 'button',
            tabIndex: 0,
            'aria-label': state.label + ' ' + state.value + ' ' + t('editHint'),
            title: t('weekdays') + ' ' + windowText + ' · ' + t('editHint'),
            onClick: beginEdit,
            onKeyDown: function (event) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                beginEdit();
              }
            },
          },
            h('span', { className: 'dsh-gohome__label' }, state.label),
            h('span', { className: 'dsh-gohome__value' }, state.value),
            h('span', { className: 'dsh-gohome__edit' }, h(EditGlyph, null)),
          ),
          state.showMeter ? h('span', { className: 'dsh-gohome__meter', 'aria-hidden': true },
            h('span', {
              className: 'dsh-gohome__fill',
              style: { width: state.percent + '%', background: state.tone },
            })) : null,
          state.showMeter ? h('span', { className: 'dsh-gohome__pct' },
            t('progress') + ' ' + state.percent + '%') : null,
        ),
      );
    }

    function SettingsPage(props) {
      const t = props.t;
      const hours = useHours();
      const now = useNow(1000);
      const [draft, setDraft] = React.useState(hours);
      const [error, setError] = React.useState('');
      const [feedback, setFeedback] = React.useState('');
      const errorId = 'dsh-gohome-settings-error';

      React.useEffect(function () {
        // An edit made elsewhere (the dock row) must not discard half-typed input here.
        setDraft(function (current) {
          const dirty = current.start !== hours.start
            || current.end !== hours.end
            || String(current.remindMinutes) !== String(hours.remindMinutes);
          return dirty ? current : hours;
        });
      }, [hours]);

      React.useEffect(function () {
        if (!feedback) return undefined;
        const id = window.setTimeout(function () { setFeedback(''); }, 3000);
        return function () { window.clearTimeout(id); };
      }, [feedback]);

      const state = computeState(hours, now, t);
      const dirty = draft.start !== hours.start
        || draft.end !== hours.end
        || String(draft.remindMinutes) !== String(hours.remindMinutes);

      function save() {
        if (isEmptyValue(draft.start) || isEmptyValue(draft.end)) {
          setError(t('emptyError'));
          setFeedback('');
          return;
        }
        if (!isValidRange(draft.start, draft.end)) {
          setError(t('rangeError'));
          setFeedback('');
          return;
        }
        const remindMinutes = Number(draft.remindMinutes);
        if (!Number.isInteger(remindMinutes) || remindMinutes < 0 || remindMinutes > REMIND_MAX_MINUTES) {
          setError(t('remindError'));
          setFeedback('');
          return;
        }
        const persisted = setHours({ start: draft.start, end: draft.end, remindMinutes });
        setError('');
        setFeedback(persisted ? t('saved') : t('saveFailed'));
      }

      function reset() {
        setHours({ ...DEFAULT_HOURS });
        setDraft({ ...DEFAULT_HOURS });
        setError('');
        setFeedback(t('reset'));
      }

      function updateDraft(field) {
        return function (event) {
          const next = { ...draft, [field]: event.target.value };
          setDraft(next);
          if (error) setError('');
          if (feedback) setFeedback('');
        };
      }

      return h(React.Fragment, null,
        h('style', null, CSS),
        h('section', { className: 'dsh-gohome-page' },
          h('h2', { className: 'dsh-gohome-page__title' }, t('nav')),
          h('p', { className: 'dsh-gohome-page__desc' }, t('settingsDesc')),
          h('label', { className: 'dsh-gohome-page__row' },
            h('span', { className: 'dsh-gohome-page__label' }, t('startLabel')),
            h('input', {
              className: 'dsh-gohome-page__input',
              type: 'time',
              value: draft.start,
              'aria-invalid': error ? true : undefined,
              'aria-describedby': error ? errorId : undefined,
              onChange: updateDraft('start'),
            }),
          ),
          h('label', { className: 'dsh-gohome-page__row' },
            h('span', { className: 'dsh-gohome-page__label' }, t('endLabel')),
            h('input', {
              className: 'dsh-gohome-page__input',
              type: 'time',
              value: draft.end,
              'aria-invalid': error ? true : undefined,
              'aria-describedby': error ? errorId : undefined,
              onChange: updateDraft('end'),
            }),
          ),
          h('label', { className: 'dsh-gohome-page__row' },
            h('span', { className: 'dsh-gohome-page__label' }, t('remind')),
            h('input', {
              className: 'dsh-gohome-page__input',
              type: 'number',
              min: 0,
              max: REMIND_MAX_MINUTES,
              step: 5,
              value: draft.remindMinutes,
              'aria-invalid': error ? true : undefined,
              'aria-describedby': error ? errorId : undefined,
              onChange: updateDraft('remindMinutes'),
            }),
            h('span', { className: 'dsh-gohome-page__label' }, t('minutes')),
          ),
          error ? h('p', { className: 'dsh-gohome-page__error', id: errorId, role: 'alert' }, error) : null,
          h('div', { className: 'dsh-gohome-page__actions' },
            h('button', {
              type: 'button',
              className: 'dsh-gohome-page__btn dsh-gohome-page__btn--primary',
              onClick: save,
              disabled: !dirty,
            }, t('save')),
            h('button', { type: 'button', className: 'dsh-gohome-page__btn', onClick: reset }, t('resetButton')),
            feedback ? h('span', { className: 'dsh-gohome-page__feedback', role: 'status' }, feedback) : null,
          ),
          h('p', { className: 'dsh-gohome-page__desc' },
            t('now') + ' · ' + state.label + ' ',
            h('span', { className: 'dsh-gohome-page__now' }, state.value),
            state.showMeter ? ' · ' + t('progress') + ' ' + state.percent + '%' : null,
          ),
          h('p', { className: 'dsh-gohome-page__hint' }, t('storageNote')),
        ),
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const locale = ctx.get('locale');
        let translate = function (key) {
          return FALLBACK[key] === undefined ? key : FALLBACK[key];
        };

        if (locale && typeof locale.register === 'function') {
          ctx.effect(function () {
            const disposeEn = locale.register(NS, 'en', DICTS.en);
            const disposeZh = locale.register(NS, 'zh', DICTS.zh);
            return function () {
              disposeZh();
              disposeEn();
            };
          }, 'dsh-gohome dictionaries');
        }
        if (locale && typeof locale.bind === 'function') {
          translate = locale.bind(NS);
        }

        // Another window or the settings modal may change the value; keep this page in step.
        ctx.effect(function () {
          function onStorage(event) {
            if (event.key === STORAGE_KEY || event.key === null) reloadFromStorage();
          }
          window.addEventListener('storage', onStorage);
          return function () { window.removeEventListener('storage', onStorage); };
        }, 'dsh-gohome storage sync');

        function Entry() {
          useLocaleRevision(locale);
          return h(Countdown, { t: translate });
        }

        function SettingsEntry() {
          useLocaleRevision(locale);
          return h(SettingsPage, { t: translate });
        }

        ctx.slots.inject('conversation.composer.dock', function () {
          return ctx.slots.register({
            name: 'conversation.composer.dock',
            id: 'dsh-gohome',
            order: 999,
            label: function () { return translate('untilOffWork'); },
          }, Entry);
        });

        ctx.slots.inject('settings.section', function () {
          return ctx.slots.register({
            name: 'settings.section',
            id: 'dsh-gohome',
            order: 25,
            label: function () { return translate('nav'); },
          }, SettingsEntry);
        });
      },
    };
  },
});