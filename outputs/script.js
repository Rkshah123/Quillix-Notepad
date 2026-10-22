(() => {
  'use strict';

  const KEYS = {
    topics: 'developer-notes-topics',
    selected: 'developer-notes-selected',
    tabs: 'developer-notes-open-tabs',
    theme: 'developer-notes-theme',
    editorTheme: 'developer-notes-editor-theme',
    settings: 'developer-notes-settings',
    recents: 'developer-notes-recents',
    expanded: 'developer-notes-expanded',
    trash: 'developer-notes-trash',
    archive: 'developer-notes-archive',
    history: 'developer-notes-history',
    drafts: 'developer-notes-drafts',
    tags: 'developer-notes-tags'
  };

  const APP_THEMES = [
    { id: 'light', number: 1, name: 'Light', colorScheme: 'light', themeColor: '#f4f7fb', icon: 'fa-moon' },
    { id: 'dark', number: 2, name: 'Dark', colorScheme: 'dark', themeColor: '#0c1220', icon: 'fa-sun' },
    { id: 'ember', number: 3, name: 'Ember', colorScheme: 'dark', themeColor: '#1c1210', icon: 'fa-fire' },
    { id: 'phosphor', number: 4, name: 'Phosphor', colorScheme: 'light', themeColor: '#f4fbf6', icon: 'fa-leaf' }
  ];

  const DEFAULT_SETTINGS = {
    fontSize: 15,
    tabSize: 4,
    wordWrap: true,
    autosave: true
  };

  const MAIN_LANGUAGE = { id: 'text', label: 'Plain Text', extensions: ['txt'] };
  const EDITOR_PLACEHOLDER = 'Start typing your notes…';
  const SUBTOPIC_LANGUAGES = [
    MAIN_LANGUAGE,
    { id: 'javascript', label: 'JavaScript', extensions: ['js', 'mjs'] },
    { id: 'typescript', label: 'TypeScript', extensions: ['ts', 'tsx', 'jsx'] },
    { id: 'python', label: 'Python', extensions: ['py'] },
    { id: 'html', label: 'HTML', extensions: ['html', 'htm'] },
    { id: 'css', label: 'CSS', extensions: ['css', 'scss', 'less'] },
    { id: 'java', label: 'Java', extensions: ['java'] },
    { id: 'cpp', label: 'C++', extensions: ['cpp', 'cc', 'cxx'] },
    { id: 'c', label: 'C', extensions: ['c', 'h'] },
    { id: 'markdown', label: 'Markdown', extensions: ['md', 'markdown'] },
    { id: 'json', label: 'JSON', extensions: ['json'] },
    { id: 'xml', label: 'XML', extensions: ['xml'] },
    { id: 'sql', label: 'SQL', extensions: ['sql'] },
    { id: 'yaml', label: 'YAML', extensions: ['yml', 'yaml'] }
  ];
  const LANGUAGE_BY_ID = new Map(SUBTOPIC_LANGUAGES.map((language) => [language.id, language]));

  const TEMPLATES = [
    {
      id: 'daily-journal',
      title: 'Daily Journal',
      content: '# Daily Journal\n\n## Date: [today]\n\n### Wins\n- \n\n### Challenges\n- \n\n### Ideas\n- '
    },
    {
      id: 'meeting-notes',
      title: 'Meeting Notes',
      content: '# Meeting Notes — [topic]\n\n**Date**: \n**Attendees**: \n\n## Agenda\n1. \n\n## Decisions\n- \n\n## Action items\n- [ ] '
    },
    {
      id: 'study-notes',
      title: 'Study Notes',
      content: '# Study Notes — [subject]\n\n## Key concepts\n- \n\n## Questions\n- \n\n## Summary\n'
    },
    {
      id: 'coding-notes',
      title: 'Coding Notes',
      content: '# Coding Notes — [project]\n\n## Goal\n\n## Snippet\n```\n\n```\n\n## Outcome\n'
    },
    {
      id: 'task-checklist',
      title: 'Task Checklist',
      content: '# Task Checklist\n\n- [ ] '
    },
    {
      id: 'blank-note',
      title: 'Blank Note',
      content: ''
    }
  ];

  const CODE_MIRROR_THEMES = {
    plain: 'default',
    ember: 'default',
    phosphor: 'default',
    github: 'default',
    oneDark: 'one-dark',
    dracula: 'dracula',
    monokai: 'monokai'
  };

  const $ = (selector) => document.querySelector(selector);
  const isDesktopLayout = () => window.matchMedia('(min-width: 760px)').matches;

  const elements = {
    sidebar: $('#sidebar'),
    backdrop: $('#sidebarBackdrop'),
    topicList: $('#topicList'),
    recentList: $('#recentList'),
    topicCount: $('#topicCount'),
    globalSearch: $('#globalSearchInput'),
    emptyState: $('#emptyState'),
    emptyStateTitle: $('#emptyStateTitle'),
    emptyStateDescription: $('#emptyStateDescription'),
    mobileHomeTopicList: $('#mobileHomeTopicList'),
    editorArea: $('#editorArea'),
    noteTabs: $('#noteTabs'),
    noteTabContextMenu: $('#noteTabContextMenu'),
    noteTabSplitButton: $('#noteTabSplitButton'),
    editorHost: $('#editorHost'),
    title: $('#topicTitle'),
    edited: $('#lastEdited'),
    language: $('#languageSelect'),
    editorTheme: $('#editorThemeSelect'),
    favorite: $('#favoriteButton'),
    pin: $('#pinButton'),
    vault: $('#vaultButton'),
    lockedState: $('#lockedNoteState'),
    unlockNote: $('#unlockNoteButton'),
    status: $('#saveStatus'),
    words: $('#wordCount'),
    chars: $('#characterCount'),
    lines: $('#lineCount'),
    cursor: $('#cursorStatus'),
    languageStatus: $('#languageStatus'),
    modal: $('#modalLayer'),
    modalTitle: $('#modalTitle'),
    modalDescription: $('#modalDescription'),
    modalIcon: $('#modalIcon'),
    modalInputWrap: $('#modalInputWrap'),
    modalInput: $('#modalInput'),
    modalConfirm: $('#modalConfirm'),
    modalCancel: $('#modalCancel'),
    formError: $('#formError'),
    settingsLayer: $('#settingsLayer'),
    fontSize: $('#fontSizeSetting'),
    tabSize: $('#tabSizeSetting'),
    wordWrap: $('#wordWrapSetting'),
    autosave: $('#autosaveSetting'),
    searchPanel: $('#editorSearchPanel'),
    findInput: $('#currentSearchInput'),
    replaceInput: $('#replaceInput'),
    searchCount: $('#searchCount'),
    editorFrame: $('#editorFrame'),
    markdownPreview: $('#markdownPreview'),
    fileInput: $('#fileInput'),
    wordInput: $('#wordInput'),
    lineNumbers: $('#lineNumbersSetting'),
    storageUsage: $('#storageUsage'),
    storageCounts: $('#storageCounts'),
    imageInput: $('#imageInput'),
    imageReplaceInput: $('#imageReplaceInput'),
    imageContextPanel: $('#imageContextPanel'),
    imageResizeHandles: $('#imageResizeHandles')
  };


  let topics = readTopics();
  let selectedRef = readSelectedRef();
  let openTabs = readOpenTabs();
  let settings = readSettings();
  let recents = readRecents();
  let expanded = readExpanded();
  let trash = readTrash();
  let archived = readArchive();
  let noteTags = readTags();
  let history = readHistory();
  let drafts = readDrafts();
  let modalAction = null;
  let saveTimer = 0;
  let saveHadError = false;
  let saveRetryTimer = 0;
  let searchMatchIndex = -1;
  let markdownPreviewOpen = false;
  let editor = null;
  let codeMirror = null;
  let codeColorMarks = [];
  let activeEditorType = '';
  let suppressChange = false;
  let savedEditorSelection = null;
  /* Declared with the other state, not down by its handlers: initialize()
     renders before that later `let` line is evaluated, and renderNoteTabs()
     writes this ref on mobile — reading it from the temporal dead zone threw
     and aborted render() before renderEditor() could open the note. */
  let contextNoteTabRef = '';
  /* Split view state sits here for the same reason: applyEditorTheme() reaches
     syncSplitTheme() while initialize() is still running, so a `let` declared
     further down would be in the temporal dead zone and abort the module. */
  let splitState = null;          // { ref } of the note shown on the right
  let splitCodeMirror = null;     // CodeMirror instance for the right pane
  let splitEditorEl = null;       // contenteditable for rich/plain right pane
  let splitSuppress = false;      // guards programmatic setValue from re-committing
  let splitColorMarks = [];       // colour marks belonging to the right pane
  let savedSplitSelection = null; // caret/selection memory for the right pane
  /* Which panel the toolbar acts on. Set by clicking into a panel, so formatting
     never leaks across: each note keeps its own colours, size and wrap. */
  let activePane = 'left';

  /* Image store constants + connection cache must be assigned BEFORE
     initialize(): startup note hydration calls getImage() synchronously, and a
     read that lands before these assignments either throws (let/const TDZ) or
     opens IndexedDB under the wrong name — both make the first image of every
     note hydrate as missing. */
  var IMAGE_DB_NAME = 'quillix-images';
  var IMAGE_STORE = 'images';
  var imageDbPromise = null;

  initialize();

  function initialize() {
    window.__developerNotesCodeMirrorReady = () => {
      const selected = selectedItem();
      if (selected?.item.language !== 'text') renderEditor();
    };
    populateSubtopicLanguages();
    bindEvents();
    applyAppTheme(localStorage.getItem(KEYS.theme) || 'dark');
    applyEditorTheme(localStorage.getItem(KEYS.editorTheme) || 'oneDark');
    applySettingsToControls();
    applySidebarWidth();
    syncSidebarToggleState();
    if (!isDesktopLayout()) {
      /* Mobile opens on the home topic list so notes are always discoverable. */
      selectedRef = { type: 'topic', topicId: '' };
    } else {
      /* Desktop: start with an empty workspace — no note auto-opens.
         The previously-saved selection is deliberately discarded so the
          app always starts fresh on the desktop, even if a note was
          open when it was last closed. */
      selectedRef = { type: 'topic', topicId: '' };
    }
    render();
    setTimeout(checkRecoveredDrafts, 400);
    registerServiceWorker();
    loadCodeMirrorAssets();
  }

  function loadCodeMirrorAssets() {
    const styles = [
      'vendor/codemirror/codemirror.min.css',
      'vendor/codemirror/foldgutter.min.css',
      'vendor/codemirror/dracula.min.css',
      'vendor/codemirror/monokai.min.css',
      'vendor/codemirror/one-dark.min.css'
    ];
    styles.forEach((href) => {
      if (document.querySelector(`link[href^="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${href}?v=4.1`;
      document.head.append(link);
    });

    const scripts = [
      'vendor/codemirror/codemirror.min.js',
      'vendor/codemirror/closebrackets.min.js',
      'vendor/codemirror/matchbrackets.min.js',
      'vendor/codemirror/foldcode.min.js',
      'vendor/codemirror/foldgutter.min.js',
      'vendor/codemirror/brace-fold.min.js',
      'vendor/codemirror/indent-fold.min.js',
      'vendor/codemirror/javascript.min.js',
      'vendor/codemirror/clike.min.js',
      'vendor/codemirror/python.min.js',
      'vendor/codemirror/yaml.min.js',
      'vendor/codemirror/xml.min.js',
      'vendor/codemirror/css.min.js',
      'vendor/codemirror/htmlmixed.min.js',
      'vendor/codemirror/markdown.min.js',
      'vendor/codemirror/sql.min.js',
      'vendor/codemirror/yaml.min.js',
      'vendor/codemirror/typescript.min.js'
    ];

    scripts.reduce((promise, src) => {
      return promise.then(() => new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = resolve;
        document.head.append(script);
      }));
    }, Promise.resolve()).then(() => {
      if (window.CodeMirror) window.__developerNotesCodeMirrorReady();
    });
  }

  function bindDesktopMenu() {
    if (!window.quillixDesktop?.isDesktop) return;
    window.quillixDesktop.on('quillix:new-topic', () => openTopicModal('createTopic'));
    window.quillixDesktop.on('quillix:find', () => openSearch(false));
    window.quillixDesktop.on('quillix:replace', () => openSearch(true));
    window.quillixDesktop.on('quillix:backup', exportBackup);
    /* File → Import File… hands over file contents read in the main process,
       so the dialog opens instantly and no user-activation quirk can block it. */
    window.quillixDesktop.on('quillix:import-data', (items) => {
      if (!Array.isArray(items) || !items.length) return;
      const safe = items.filter((it) => it && typeof it.name === 'string' && typeof it.text === 'string').slice(0, 50);
      if (safe.length) applyImportedItems(safe);
    });
    window.quillixDesktop.on('quillix:import-skipped', (names) => {
      if (Array.isArray(names) && names.length) openNotice('Some files skipped', 'Skipped: ' + names.join(', ') + '. Files must be readable and 25 MB or smaller.');
    });
    window.quillixDesktop.on('quillix:insert-image-error', () => openNotice('Could not insert image', 'The image could not be read. Try another file.'));
    /* Image bytes arrive pre-read from the native dialog. */
    window.quillixDesktop.on('quillix:insert-image-data', async (payload) => {
      try {
        if (!payload || typeof payload.name !== 'string' || typeof payload.type !== 'string' || !payload.type.startsWith('image/')) return;
        const bytes = payload.data instanceof Uint8Array ? payload.data : null;
        if (!bytes || !bytes.length || bytes.length > 25 * 1024 * 1024) return;
        const target = imageInsertTarget();
        if (!target?.item) { openNotice('No note open', 'Open a text note first, then insert the image.'); return; }
        if (target.item.language !== 'text') { openNotice('Images need a text note', 'Switch this note to Plain text to insert images between paragraphs.'); return; }
        const file = new File([bytes], payload.name, { type: payload.type });
        const id = imageId();
        const imageData = await loadImageFile(file);
        await putImage(id, imageData.blob);
        insertImageMarkup(target.item, id, imageData);
        focusAfterImage();
      } catch (error) {
        if (!/abort/i.test(String(error))) openNotice('Could not insert image', 'The image could not be read. Try another file.');
      }
    });
    /* File → Open Word Document… hands over file bytes read in main. */
    window.quillixDesktop.on('quillix:word-data', (payload) => {
      if (!payload || typeof payload.name !== 'string' || !payload.data) return;
      const bytes = payload.data instanceof Uint8Array ? payload.data : null;
      if (!bytes || !bytes.length) return;
      importWordFromBytes(payload.name, bytes);
    });
    window.quillixDesktop.on('quillix:word-error', (message) => {
      openNotice('Could not open Word file', String(message || 'The file could not be read.'));
    });
    window.quillixDesktop.on('quillix:import', () => {
      /* Kept for older packaged builds; the modern flow uses quillix:import-data. */
      setSavedEditorSelectionForPicker();
      elements.fileInput.click();
    });
    window.quillixDesktop.on('quillix:insert-image', insertImage);
  }

  function bindEvents() {
    $('#newTopicButton').addEventListener('click', () => openTopicModal('createTopic'));
    $('#mobileNewButton').addEventListener('click', () => openTopicModal('createTopic'));
    $('[data-open-create]').addEventListener('click', () => openTopicModal('createTopic'));
    $('#menuButton').addEventListener('click', openSidebar);
    elements.backdrop.addEventListener('click', closeSidebar);
    elements.globalSearch.addEventListener('input', renderTopicList);
    elements.topicList.addEventListener('click', handleTopicListClick);
    elements.mobileHomeTopicList.addEventListener('click', handleMobileHomeTopicClick);
    /* Tapping the app title on mobile returns to the home topic list. No CSS,
       cursor or hover affordance is added: the title looks exactly as before. */
    $('.mobile-brand')?.addEventListener('click', goToMobileHome);
    elements.noteTabs.addEventListener('click', handleNoteTabsClick);
    elements.noteTabs.addEventListener('contextmenu', handleNoteTabsContextMenu);
    /* The strip's scrollbar is hidden, so wheel input scrolls it horizontally. */
    elements.noteTabs.addEventListener('wheel', (event) => {
      if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      elements.noteTabs.scrollLeft += event.deltaY;
    }, { passive: false });
    elements.noteTabSplitButton.addEventListener('click', splitContextNoteTab);
    document.addEventListener('click', closeNoteTabContextMenu);
    window.addEventListener('resize', handleLayoutResize);
    elements.recentList.addEventListener('click', handleRecentClick);
    elements.language.addEventListener('change', changeEditorLanguage);
    /* In split view the toolbar's appearance controls follow the active panel,
       so changing one note's theme/language never restyles the other. */
    elements.editorTheme.addEventListener('change', () => {
      if (splitState && activePane === 'right') setPaneTheme('right', elements.editorTheme.value);
      else applyEditorTheme(elements.editorTheme.value);
    });
    elements.favorite.addEventListener('click', () => toggleTopicFlag('favorite'));
    elements.pin.addEventListener('click', () => toggleTopicFlag('pinned'));
    elements.vault.addEventListener('click', openLockModal);
    elements.unlockNote.addEventListener('click', openUnlockModal);
    elements.modalInput.addEventListener('input', () => {
      if (elements.modalInput.dataset.pinOnly !== 'true') return;
      const digitsOnly = elements.modalInput.value.replace(/\D/g, '').slice(0, 12);
      if (elements.modalInput.value !== digitsOnly) elements.modalInput.value = digitsOnly;
    });
    $('#deleteCurrentButton').addEventListener('click', deleteCurrentItem);
    $('#recentPanelButton').addEventListener('click', openRecentPanel);
    $('#recentClose').addEventListener('click', closeRecentPanel);
    $('#recentDone').addEventListener('click', closeRecentPanel);
    $('#recentLayer').addEventListener('click', (event) => event.target === $('#recentLayer') && closeRecentPanel());
    $('#themeSlider')?.addEventListener('input', (event) => {
      const theme = APP_THEMES[Number(event.target.value) - 1];
      if (theme) { applyAppTheme(theme.id); saveNow(); }
    });
    /* Range inputs clamp at the ends, so wrap manually: 4 -> 1 forward, 1 -> 4 back. */
    $('#themeSlider')?.addEventListener('keydown', (event) => {
      const slider = event.currentTarget;
      const value = Number(slider.value);
      if ((event.key === 'ArrowRight' || event.key === 'ArrowUp') && value >= APP_THEMES.length) {
        event.preventDefault();
        applyAppTheme(APP_THEMES[0].id); saveNow();
      } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowDown') && value <= 1) {
        event.preventDefault();
        applyAppTheme(APP_THEMES[APP_THEMES.length - 1].id); saveNow();
      }
    });
    document.querySelectorAll('[data-theme-tick]').forEach((tick, index) => {
      tick.style.cursor = 'pointer';
      tick.addEventListener('click', () => {
        const theme = APP_THEMES[index];
        if (theme) { applyAppTheme(theme.id); saveNow(); }
      });
    });
    $('#findButton').addEventListener('click', () => openSearch(false));
    $('#replaceButton').addEventListener('click', () => openSearch(true));
    $('#closeSearchButton').addEventListener('click', closeSearch);
    elements.findInput.addEventListener('input', updateSearch);
    elements.replaceInput.addEventListener('input', updateSearch);
    $('#nextResultButton').addEventListener('click', () => goToMatch(1));
    $('#previousResultButton').addEventListener('click', () => goToMatch(-1));
    $('#replaceOneButton').addEventListener('click', replaceOne);
    $('#replaceAllButton').addEventListener('click', replaceAllMatches);
    $('#undoButton').addEventListener('click', undoEditor);
    $('#redoButton').addEventListener('click', redoEditor);
    ['#textColorButton', '#decreaseFontButton', '#increaseFontButton'].forEach((selector) => {
      $(selector).addEventListener('mousedown', savePaneSelection);
    });
    $('#textColorButton').addEventListener('click', () => {
      savePaneSelection();
      $('#textColorPicker').click();
    });
    $('#textColorPicker').addEventListener('input', (event) => applyTextColor(event.target.value));
    $('#decreaseFontButton').addEventListener('click', () => changeSelectedTextSize(-1));
    $('#increaseFontButton').addEventListener('click', () => changeSelectedTextSize(1));
    $('#wordWrapButton').addEventListener('click', toggleWordWrapForActivePane);
    $('#previewButton').addEventListener('click', toggleMarkdownPreview);
    $('#focusButton').addEventListener('click', toggleFocusMode);
    $('#focusRestoreButton').addEventListener('click', restoreFocusMode);
    $('#backupButton').addEventListener('click', exportBackup);
    $('#pdfExportButton').addEventListener('click', exportPdf);
    $('#htmlExportButton').addEventListener('click', exportHtml);
    $('#exportButton').addEventListener('click', exportCurrentItem);
    $('#importButton').addEventListener('click', () => elements.fileInput.click());
    $('#wordImportButton').addEventListener('click', () => { elements.wordInput.value = ''; elements.wordInput.click(); });
    elements.wordInput.addEventListener('change', importWordFromFiles);
    $('#shareButton').addEventListener('click', shareCurrentNote);
    ['dragover', 'drop'].forEach((type) => document.body.addEventListener(type, (event) => {
      if (!event.dataTransfer?.files?.length) return;
      if (type === 'dragover') { event.preventDefault(); return; }
      event.preventDefault();
      DataTransfer.prototype.constructor && importFileList(event.dataTransfer.files);
    }));
    $('#exportAllButton').addEventListener('click', exportAllText);
    $('#templatesButton').addEventListener('click', insertPromptTemplate);
    $('#trashButton').addEventListener('click', openTrashManager);
    $('#archiveButton').addEventListener('click', openArchiveManager);
    $('#topicHistoryButton').addEventListener('click', openHistoryManager);
    elements.modal.addEventListener('click', handleManagerClick);
    elements.fileInput.addEventListener('change', importFiles);
    $('#settingsButton').addEventListener('click', openSettings);
    $('#settingsClose').addEventListener('click', closeSettings);
    $('#settingsDone').addEventListener('click', closeSettings);
    elements.fontSize.addEventListener('change', () => updateSetting('fontSize', Number(elements.fontSize.value)));
    elements.tabSize.addEventListener('change', () => updateSetting('tabSize', Number(elements.tabSize.value)));
    elements.wordWrap.addEventListener('change', () => updateSetting('wordWrap', elements.wordWrap.checked));
    elements.autosave.addEventListener('change', () => updateSetting('autosave', elements.autosave.checked));
    elements.lineNumbers?.addEventListener('change', () => { updateSetting('lineNumbers', elements.lineNumbers.checked); applyLineNumbers(); });
    $('#imageInsertButton').addEventListener('click', insertImage);
    elements.imageInput.addEventListener('change', importImageFromFiles);
    $('#imageContextClose').addEventListener('click', closeImageContextPanel);
    $('#imageContextPanel').addEventListener('mousedown', (event) => event.target.closest('#imageContextPanel') && event.target.closest('button, input, select') && setTimeout(() => positionImageContextPanel(), 0));
    document.querySelectorAll('#imageContextPanel [data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => applyImagePreset(btn.dataset.preset));
    });
    document.querySelectorAll('[data-align]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!selectedImage || !editor?.contains(selectedImage)) return;
        setImageAlignment(selectedImage, btn.dataset.align);
        updateImageContextPanel();
      });
    });
    $('#imageReplaceButton').addEventListener('click', replaceSelectedImage);
    $('#imageDeleteButton').addEventListener('click', deleteSelectedImage);
    $('#imageRestoreButton').addEventListener('click', restoreOriginalSize);
    /* Single sidebar control: it hides the sidebar when open and restores it when
       hidden, from the same slot in the note-tab row — so it tracks the panel edge
       when the divider is dragged (see #sidebarCollapseToggle in style.css). */
    $('#sidebarCollapseToggle').addEventListener('click', () => {
      const wasCollapsed = elements.sidebar.classList.contains('collapsed');
      setSidebarCollapsed(!wasCollapsed);
      syncSidebarToggleState();
    });
    const divider = $('#sidebarDivider');
    if (divider) {
      divider.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setSidebarCollapsed(!elements.sidebar.classList.contains('collapsed'));
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          const startW = elements.sidebar.getBoundingClientRect().width;
          const step = event.shiftKey ? 48 : 16;
          const next = Math.max(0, startW + (event.key === 'ArrowRight' ? step : -step));
          if (next < 160) setSidebarCollapsed(true);
          else setSidebarWidth(next, true);
        }
      });
      divider.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        divider.dataset.dragging = 'true';
        document.body.classList.add('sidebar-resizing');
        document.body.style.cursor = 'col-resize';
        const startX = event.clientX;
        const startWidth = elements.sidebar.getBoundingClientRect().width;
        const maxW = window.innerWidth - 240;
        /* Below the minimum the sidebar snaps closed while dragging so it never
           sits at an unusable sliver width. */
        const MIN_W = 160;
        const onMove = (ev) => {
          const raw = startWidth + (ev.clientX - startX);
          const next = raw <= MIN_W ? 0 : Math.min(maxW, Math.max(MIN_W, raw));
          setSidebarWidth(next, false);
        };
        const onUp = (ev) => {
          divider.dataset.dragging = '';
          document.body.classList.remove('sidebar-resizing');
          document.body.style.cursor = '';
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          const finalW = Math.max(0, Math.min(maxW, startWidth + (ev.clientX - startX)));
          /* Releasing at the minimum collapses; anything else stays open and persists. */
          setSidebarCollapsed(finalW <= MIN_W);
          if (finalW > MIN_W) setSidebarWidth(finalW, true);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }
    $('#modalClose').addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    elements.modalConfirm.addEventListener('click', confirmModal);
    elements.modal.addEventListener('click', (event) => event.target === elements.modal && closeModal());
    elements.settingsLayer.addEventListener('click', (event) => event.target === elements.settingsLayer && closeSettings());

    /* Split view: toolbar toggle, note-tab context menu, panel headers, and the
       divider drag. */
    $('#splitViewButton').addEventListener('click', toggleSplitView);
    $('#splitLeftClose')?.addEventListener('click', closeLeftPane);
    $('#splitLeftTheme')?.addEventListener('change', () => setPaneTheme('left', $('#splitLeftTheme').value));
    /* Clicking into a panel makes it the target of every formatting action. */
    elements.editorFrame.addEventListener('pointerdown', (event) => {
      if (!splitState) return;
      if (event.target.closest('#splitPane')) setActivePane('right');
      else if (event.target.closest('#splitLeftBar, #editorHost')) setActivePane('left');
    }, true);
    elements.editorFrame.addEventListener('focusin', (event) => {
      if (!splitState) return;
      if (event.target.closest('#splitPane')) setActivePane('right');
      else if (event.target.closest('#editorHost')) setActivePane('left');
    });
    $('#noteTabSplitViewButton').addEventListener('click', () => {
      const ref = contextNoteTabRef;
      closeNoteTabContextMenu();
      openSplitView(ref);
    });
    bindSplitDividerDrag();
    bindNoteDragAndDrop();
    /* Right-clicking either editor opens split view on the *other* note, so the
       gesture always produces two different panes rather than one note twice. */
    elements.editorFrame.addEventListener('contextmenu', (event) => {
      if (!isDesktopLayout()) return;
      if (event.target.closest('#splitPane')) {
        event.preventDefault();
        openSplitView(refToString(selectedRef));
        return;
      }
      if (event.target.closest('#editorHost')) {
        event.preventDefault();
        const other = listAllRefs().map((entry) => entry.ref).find((candidate) => candidate !== refToString(selectedRef));
        if (other) openSplitView(other);
      }
    });
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleSplitView();
      }
    }, true);
    // Capture phase makes this reliable for every part of the application, including
    // controls which stop propagation in the future. Menu actions are deliberately
    // excluded so their click handler can run first.
    document.addEventListener('pointerdown', closeTopicMenusOnOutsidePointer, true);
    document.addEventListener('keydown', handleGlobalKeys, true);
    bindDesktopMenu();
  }

  function populateSubtopicLanguages() {
    elements.language.innerHTML = SUBTOPIC_LANGUAGES.map((language) => `<option value="${language.id}">${language.label}</option>`).join('');
  }

  function render() {
    renderTopicList();
    renderMobileHomeTopics();
    renderNoteTabs();
    renderRecentList();
    renderEditor();
    refreshSplitPaneHeader();
    renderSplitLeftBar();
    setActivePane(activePane);
    saveNow();
  }

  function renderTopicList() {
    const query = elements.globalSearch.value.trim().toLowerCase();
    const visibleTopics = sortedTopics(topics).filter((topic) => matchesTree(topic, query));
    elements.topicCount.textContent = topics.length;
    elements.topicList.innerHTML = visibleTopics.map((topic) => topicTreeHtml(topic, query)).join('') || `<p class="no-results">${query ? 'No matches.' : 'No topics yet.'}</p>`;
  }

  function renderMobileHomeTopics() {
    const list = elements.mobileHomeTopicList;
    const mobile = !isDesktopLayout();
    /* With topics on screen the block is a list screen, not an empty state:
       the CSS drops the illustration and turns the heading + button into a
       compact header row. Desktop and the true empty state are unchanged. */
    if (mobile && topics.length > 0) {
      elements.emptyState.classList.add('home-list');
      elements.emptyState.classList.remove('hidden');
      sizeMobileHomeList();
    } else {
      elements.emptyState.classList.remove('home-list');
      elements.emptyState.classList.add('hidden');
      elements.emptyState.style.removeProperty('height');
    }
    if (!mobile) {
      list.classList.add('hidden');
      list.innerHTML = '';
      elements.emptyStateTitle.textContent = 'No topics yet.';
      elements.emptyStateDescription.textContent = 'Create a topic to start writing.';
      return;
    }
    if (!topics.length) {
      list.classList.add('hidden');
      list.innerHTML = '';
      elements.emptyStateTitle.textContent = 'No topics yet.';
      elements.emptyStateDescription.textContent = 'Create a topic to start writing.';
      return;
    }
    elements.emptyStateTitle.textContent = 'Notes Library';
    elements.emptyStateDescription.textContent = 'Choose a note to continue or create a new one.';
    const createButton = elements.emptyState.querySelector('[data-open-create]');
    if (createButton) {
      createButton.innerHTML = '<i class="fa-solid fa-plus"></i> Create Notes';
      createButton.setAttribute('aria-label', 'Create Notes');
    }
    list.classList.remove('hidden');
    list.innerHTML = sortedTopics(topics).map((topic) => `
      <div class="mobile-home-topic-card">
        <button class="mobile-home-topic" type="button" data-mobile-topic-id="${escapeHtml(topic.id)}">
          <i class="fa-solid ${topic.locked ? 'fa-lock' : 'fa-file-lines'}"></i>
          <span>${escapeHtml(topic.locked ? 'Locked note' : topic.title)}</span>
          <i class="fa-solid fa-chevron-right mobile-home-topic-arrow"></i>
        </button>
        ${(topic.subtopics || []).map((subtopic) => `
          <button class="mobile-home-subtopic" type="button" data-mobile-topic-id="${escapeHtml(topic.id)}" data-mobile-subtopic-id="${escapeHtml(subtopic.id)}">
            <i class="fa-solid fa-code"></i><span>${escapeHtml(subtopic.title)}</span><i class="fa-solid fa-chevron-right mobile-home-topic-arrow"></i>
          </button>`).join('')}
      </div>`).join('');
    sizeMobileHomeList();
  }

  /* The CSS chain (flex + vh then dvh fallbacks) bounds the mobile home list
     on every modern engine. As the last line of defence for engines where any
     step misresolves — the box then grows to its content, overflow: hidden
     clips the bottom notes and swipes do nothing — the height is re-measured
     from the real layout and pinned only when the CSS chain actually failed. */
  function sizeMobileHomeList() {
    const container = elements.emptyState;
    const list = elements.mobileHomeTopicList;
    if (!container || !list) return;
    if (!container.classList.contains('home-list') || container.classList.contains('hidden')) {
      container.style.removeProperty('height');
      return;
    }
    const rect = container.getBoundingClientRect();
    const available = Math.round(window.innerHeight - rect.top);
    if (available > 80 && rect.height > available + 8) {
      container.style.height = `${available}px`;
    } else {
      container.style.removeProperty('height');
    }
  }

  /* Mobile home: the list of topics, reached by tapping the app title from any
     screen. Desktop is deliberately untouched (the title is hidden there). */
  function goToMobileHome() {
    if (isDesktopLayout()) return;
    selectedRef = { type: 'topic', topicId: '' };
    markdownPreviewOpen = false;
    closeSidebar();
    render();
    saveNow();
    window.scrollTo({ top: 0 });
  }

  function handleMobileHomeTopicClick(event) {
    const button = event.target.closest('[data-mobile-topic-id]');
    if (!button) return;
    const topicId = button.dataset.mobileTopicId;
    if (button.dataset.mobileSubtopicId) selectSubtopic(topicId, button.dataset.mobileSubtopicId);
    else selectTopic(topicId);
  }

  function renderNoteTabs() {
    if (!isDesktopLayout()) {
      elements.noteTabs.classList.add('hidden');
      elements.noteTabs.innerHTML = '';
      closeNoteTabContextMenu();
      return;
    }
    const validRefs = openTabs.filter((ref) => Boolean(resolveRef(ref)));
    const selectedKey = refToString(selectedRef);
    if (selectedKey && resolveRef(selectedKey) && !validRefs.includes(selectedKey)) validRefs.push(selectedKey);
    openTabs = unique(validRefs);
    elements.noteTabs.classList.toggle('hidden', !openTabs.length);
    elements.noteTabs.innerHTML = openTabs.map((ref) => {
      const resolved = resolveRef(ref);
      const active = ref === selectedKey;
      const title = resolved?.item.locked ? 'Locked note' : (resolved?.item.title || 'Untitled');
      const icon = resolved?.type === 'subtopic' ? 'fa-code' : 'fa-file-lines';
      return `<button class="note-tab ${active ? 'active' : ''}" type="button" role="tab" aria-selected="${active}" draggable="true" data-note-tab="${escapeHtml(ref)}" title="${escapeHtml(title)}"><i class="fa-solid ${icon}"></i><span class="note-tab-label">${escapeHtml(title)}</span><span class="note-tab-close" role="button" tabindex="0" data-close-tab="${escapeHtml(ref)}" aria-label="Close ${escapeHtml(title)}">×</span></button>`;
    }).join('');
    /* Keep the tab you are on visible when tabs are added, closed or switched,
       without ever scrolling the strip while the mouse is outside it. */
    setTimeout(() => {
      const active = elements.noteTabs.querySelector('.note-tab.active');
      if (!active) return;
      const strip = elements.noteTabs.getBoundingClientRect();
      const tab = active.getBoundingClientRect();
      /* The masking lane is always rendered on desktop, so the keep-visible
         check always clears the full 52px gutter — including right after the
         strip is re-shown, when a stale scroll offset could otherwise leave
         the tab underneath the mask. */
      const laneLeft = strip.left + 52;
      if (tab.left < laneLeft) elements.noteTabs.scrollLeft -= (laneLeft - tab.left);
      else if (tab.right > strip.right - 4) elements.noteTabs.scrollLeft += (tab.right - strip.right + 4);
    }, 0);
  }

  function topicTreeHtml(topic, query) {
    const subtopics = sortedSubtopics(topic.subtopics);
    const language = LANGUAGE_BY_ID.get(topic.language) || MAIN_LANGUAGE;
    const isExpanded = expanded.includes(topic.id) || Boolean(query);
    const activeTopic = selectedRef.type === 'topic' && selectedRef.topicId === topic.id;
    const visibleSubtopics = subtopics.filter((subtopic) => !query || matchesSubtopic(subtopic, query));
    return `
      <article class="topic-card main-topic-card ${activeTopic ? 'active' : ''}" data-topic-id="${topic.id}" draggable="true">
        <button class="tree-toggle" data-toggle-topic title="${isExpanded ? 'Collapse' : 'Expand'}"><i class="fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}"></i></button>
        <i class="fa-solid ${topic.pinned ? 'fa-thumbtack' : 'fa-file-lines'} topic-folder"></i>
        <div class="topic-info" data-select-topic>
          <div class="topic-name">${escapeHtml(topic.title)}</div>
          <div class="topic-date">${language.label} / ${dateLabel(topic.updatedAt)}</div>
        </div>
        <div class="topic-meta">${topic.favorite ? '<i class="fa-solid fa-star"></i>' : ''}</div>
        <button class="topic-menu" title="Topic options" data-menu><i class="fa-solid fa-ellipsis"></i></button>
        <div class="topic-actions" data-actions>
          <button data-action="addSubtopic" title="Add subtopic"><i class="fa-solid fa-diagram-project"></i></button>
          <button data-action="renameTopic" title="Rename"><i class="fa-solid fa-pen"></i></button>
          <button data-action="archiveTopic" title="Archive"><i class="fa-solid fa-box-archive"></i></button>
          <button data-action="duplicateTopic" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
          <button data-action="deleteTopic" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </article>
      <div class="subtopic-list ${isExpanded ? '' : 'hidden'}">
        ${visibleSubtopics.map((subtopic, index) => subtopicHtml(topic, subtopic, index, visibleSubtopics.length)).join('')}
      </div>`;
  }

  function subtopicHtml(topic, subtopic, index, total) {
    const active = selectedRef.type === 'subtopic' && selectedRef.topicId === topic.id && selectedRef.subtopicId === subtopic.id;
    const language = LANGUAGE_BY_ID.get(subtopic.language) || MAIN_LANGUAGE;
    return `
      <article class="topic-card subtopic-card ${active ? 'active' : ''}" data-topic-id="${topic.id}" data-subtopic-id="${subtopic.id}" draggable="true">
        <span class="tree-branch">${index === total - 1 ? '└─' : '├─'}</span>
        <i class="fa-solid fa-code topic-folder"></i>
        <div class="topic-info" data-select-subtopic>
          <div class="topic-name">${escapeHtml(subtopic.title)}</div>
          <div class="topic-date">${language.label} / ${dateLabel(subtopic.updatedAt)}</div>
        </div>
        <button class="topic-menu" title="Subtopic options" data-menu><i class="fa-solid fa-ellipsis"></i></button>
        <div class="topic-actions" data-actions>
          <button data-action="renameSubtopic" title="Rename"><i class="fa-solid fa-pen"></i></button>
          <button data-action="duplicateSubtopic" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
          <button data-action="deleteSubtopic" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </article>`;
  }

  function renderRecentList() {
    recents = recents.filter((ref) => Boolean(resolveRef(ref))).slice(0, 12);
    elements.recentList.innerHTML = recents.map((ref) => {
      const resolved = resolveRef(ref);
      const parent = resolved.type === 'subtopic' && resolved.topic ? `<small class="recent-item-parent">${escapeHtml(resolved.topic.title)}</small>` : '';
      return `<button class="recent-item" data-recent-ref="${ref}"><i class="fa-regular fa-clock"></i><span class="recent-item-text"><span>${escapeHtml(resolved.item.title)}</span>${parent}</span></button>`;
    }).join('') || '<p class="no-results compact">No recent notes yet.</p>';
    const badge = $('#recentPanelCount');
    if (badge) badge.textContent = String(recents.length);
  }

  function renderEditor() {
    const selected = selectedItem();
    const hasSelection = Boolean(selected);
    elements.emptyState.classList.toggle('hidden', hasSelection);
    elements.editorArea.classList.toggle('hidden', !hasSelection);
    if (!selected) {
      /* Desktop: when there is no open note, show a Create Notes prompt
         in the empty workspace. Mobile keeps the home topic list instead
         (that is handled in renderMobileHomeTopics). */
      if (isDesktopLayout() && topics.length > 0) {
        elements.emptyStateTitle.textContent = 'Create Notes';
        elements.emptyStateDescription.textContent = 'Start a new note in the workspace.';
        const btn = elements.emptyState.querySelector('[data-open-create]');
        if (btn) {
          btn.innerHTML = '<i class="fa-solid fa-plus"></i> Create Notes';
          btn.setAttribute('aria-label', 'Create Notes');
        }
      }
      return;
    }
    /* On mobile with no selection, the empty state must stay hidden so the
       mobile home topic list (rendered by renderMobileHomeTopics) shows
       instead. renderEditor() runs after renderMobileHomeTopics() and
       would otherwise un-hide the empty state above — so re-hide it here. */
    if (!isDesktopLayout() && !elements.emptyState.classList.contains('hidden')) {
      elements.emptyState.classList.add('hidden');
    }
    savedEditorSelection = null;

    const { type, item } = selected;
    const isSubtopic = type === 'subtopic';
    const locked = Boolean(item.locked && item.vault);
    elements.title.textContent = item.title;
    elements.edited.textContent = `Last edited ${dateLabel(item.updatedAt)}`;
    elements.language.classList.toggle('hidden', locked);
    elements.editorTheme.classList.toggle('hidden', locked);
    elements.favorite.classList.toggle('hidden', isSubtopic || locked);
    elements.pin.classList.toggle('hidden', isSubtopic || locked);
    elements.vault.classList.toggle('hidden', locked);
    elements.lockedState.classList.toggle('hidden', !locked);
    elements.editorHost.classList.toggle('hidden', locked);
    document.querySelector('.quick-toolbar').classList.toggle('hidden', locked);
    if (locked) {
      destroyCodeMirror();
      editor = null;
      activeEditorType = '';
      elements.editorHost.innerHTML = '';
      elements.editorFrame.classList.remove('preview-split');
      elements.markdownPreview.classList.add('hidden');
      elements.words.textContent = '0';
      elements.chars.textContent = '0';
      elements.lines.textContent = '0';
      elements.cursor.textContent = 'Locked';
      elements.languageStatus.textContent = 'Locked';
      return;
    }
    elements.favorite.classList.toggle('active', !isSubtopic && item.favorite);
    elements.favorite.innerHTML = `<i class="fa-${item.favorite ? 'solid' : 'regular'} fa-star"></i>`;
    elements.pin.classList.toggle('active', !isSubtopic && item.pinned);
    elements.language.value = item.language || 'text';
    elements.editorTheme.value = item.editorTheme || localStorage.getItem(KEYS.editorTheme) || 'plain';
    document.body.dataset.editorTheme = elements.editorTheme.value;
    elements.languageStatus.textContent = (LANGUAGE_BY_ID.get(item.language) || MAIN_LANGUAGE).label;
    setupEditor(type, item);
    /* Re-applied per note so each note keeps its own size/wrap in the primary
       editor too — including code notes, which have no textarea setup path. */
    applyEditorSettings();
    updateEditorStats();
    updateMarkdownPreview();
    setTimeout(() => focusEditor(), 0);
  }

  function setupEditor(type, item) {
    const shouldUseCodeMirror = item.language !== 'text' && window.CodeMirror;
    if (shouldUseCodeMirror) setupCodeMirror(item);
    else setupTextarea(item, type);
  }

  async function setupTextarea(item, type) {
    destroyCodeMirror();
    if (item.richText && isEmptyRichText(item.note)) {
      item.note = '';
      item.richText = false;
    }
    const shouldReuseRichEditor = activeEditorType === 'richtext' && editor?.dataset.editorKind === type;
    if (!shouldReuseRichEditor) {
      elements.editorHost.innerHTML = `
        <div class="fallback-editor-shell">
          <div class="fallback-editor rich-editor" id="fallbackEditor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="${EDITOR_PLACEHOLDER}"></div>
        </div>`;
      editor = $('#fallbackEditor');
      editor.addEventListener('input', handleTextareaInput);
      editor.addEventListener('keydown', handleTextareaKeydown);
      editor.addEventListener('keyup', updateCursor);
      editor.addEventListener('click', updateCursor);
      activeEditorType = 'richtext';
      initImageInteraction();
    }
    editor.dataset.editorKind = type;
    /* blob: URLs die with the page that created them, so the stale srcs in
       saved note HTML only produce failed requests before hydration replaces
       them — strip them at load and let hydrateImageElements re-bind. */
    const richValue = item.richText
      ? String(item.note || '').replace(/\s+src="blob:[^"]*"/g, '')
      : escapeHtml(item.note).replace(/\r?\n/g, '<br>');
    if (editor.innerHTML !== richValue) {
      editor.innerHTML = richValue;
      savedEditorSelection = null;
    }
    if (item.richText) await hydrateImageElements(editor);
    applyEditorSettings();
    updateEditorPlaceholder();
  }

  /* Re-bind stored image blobs from IndexedDB into existing <img> slots, in place.
     Position inside the note HTML is already correct — only the src (a dead blob:
     URL from the previous session) needs refreshing. Missing blobs keep their slot
     as a marked placeholder so nothing is lost or duplicated. */
  async function hydrateImageElements(root) {
    if (!root) return;
    const imgs = [...root.querySelectorAll('img.qlx-image[data-image-id]')];
    for (const img of imgs) {
      const id = img.getAttribute('data-image-id');
      if (!id) continue;
      img.setAttribute('draggable', 'true');
      const blob = await getImage(id).catch(() => null);
      if (blob) {
        const old = img.getAttribute('src');
        if (old && old.startsWith('blob:')) URL.revokeObjectURL(old);
        img.src = URL.createObjectURL(blob);
        img.classList.remove('qlx-image-broken');
        img.alt = 'Image';
      } else {
        img.classList.add('qlx-image-broken');
        img.removeAttribute('src');
        img.alt = '[missing image]';
      }
    }
  }
  function saveEditorSelectionToNote() {
    if (!editor?.isContentEditable) return;
    const selected = selectedItem();
    if (!selected) return;
    selected.item.richText = true;
    commitEditorValue(editor.innerHTML);
  }

  function setupCodeMirror(item) {
    if (activeEditorType !== 'codemirror') {
      elements.editorHost.innerHTML = '<textarea id="codeMirrorSource"></textarea>';
      editor = $('#codeMirrorSource');
      codeMirror = window.CodeMirror.fromTextArea(editor, {
        value: item.note,
        lineWrapping: settings.wordWrap,
        tabSize: settings.tabSize,
        indentUnit: settings.tabSize,
        indentWithTabs: false,
        smartIndent: true,
        electricChars: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        lineNumbers: settings.lineNumbers !== false,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        theme: CODE_MIRROR_THEMES[elements.editorTheme.value] || 'default',
        extraKeys: {
          'Alt-G': gotoLinePrompt,
          'Ctrl-D': cmDuplicateLine,
          Tab: indentCodeMirror,
          'Shift-Tab': unindentCodeMirror,
          Enter: smartCodeMirrorEnter,
          'Ctrl-/': toggleCodeMirrorComment
        }
      });
      codeMirror.on('change', handleCodeMirrorChange);
      codeMirror.on('cursorActivity', updateCursor);
      activeEditorType = 'codemirror';
    }
    suppressChange = true;
    if (codeMirror.getValue() !== item.note) codeMirror.setValue(item.note);
    codeMirror.setOption('mode', modeForLanguage(item.language));
    codeMirror.setOption('lineWrapping', settings.wordWrap);
    codeMirror.setOption('tabSize', settings.tabSize);
    codeMirror.setOption('indentUnit', settings.tabSize);
    codeMirror.setOption('theme', CODE_MIRROR_THEMES[elements.editorTheme.value] || 'default');
    codeMirror.setSize('100%', '100%');
    codeMirror.getWrapperElement().dataset.placeholder = EDITOR_PLACEHOLDER;
    codeColorMarks.forEach((mark) => mark.clear());
    codeColorMarks = (item.textColors || []).map((mark) => codeMirror.markText(
      codeMirror.posFromIndex(mark.start),
      codeMirror.posFromIndex(mark.end),
      { css: `color: ${mark.color}` }
    ));
    suppressChange = false;
    updateEditorPlaceholder();
    /* Optional chaining: the pane/editor can be torn down (split closed, last
       tab closed) before this timer fires — refresh then has nothing to do. */
    setTimeout(() => codeMirror?.refresh(), 0);
  }

  function destroyCodeMirror() {
    if (!codeMirror) return;
    codeColorMarks.forEach((mark) => mark.clear());
    codeColorMarks = [];
    codeMirror.toTextArea();
    codeMirror = null;
    activeEditorType = '';
  }

  function handleTextareaInput() {
    const selected = selectedItem();
    if (!selected) return;
    const value = normalizeRichEditorValue(editor);
    selected.item.richText = Boolean(value);
    commitEditorValue(value);
  }

  function handleCodeMirrorChange(instance) {
    if (suppressChange) return;
    commitEditorValue(instance.getValue());
  }

  function commitEditorValue(value) {
    const selected = selectedItem();
    if (!selected) return;
    let nextValue = String(value ?? '');
    if (editor?.isContentEditable && selected.item.richText) {
      nextValue = normalizeRichEditorValue(editor);
      if (!nextValue) selected.item.richText = false;
    }
    selected.item.note = nextValue;
    selected.item.updatedAt = new Date().toISOString();
    if (selected.type === 'subtopic') selected.topic.updatedAt = selected.item.updatedAt;
    /* Keep an unmerged value for every pending draft so user ref IDs (which can collide
       across a same millisecond across saves) stay fully coherent for recovery. */
    drafts[refToString(selectedRef)] = { note: nextValue, saved: Date.now() };
    safeSetRaw(KEYS.drafts, JSON.stringify(drafts));
    elements.edited.textContent = 'Last edited just now';
    updateEditorStats();
    updateMarkdownPreview();
    renderTopicList();
    markSaving();
    clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      const entry = selectedItem();
      if (entry && entry.item === selected.item) snapshotHistory(refToString(selectedRef), selected.item);
    }, 4000);
    if (settings.autosave) scheduleSave();
  }

  let historyTimer = 0;

  function handleTextareaKeydown(event) {
    if (editor?.isContentEditable) {
      if (event.key === 'Tab') {
        event.preventDefault();
        document.execCommand(event.shiftKey ? 'outdent' : 'indent');
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        insertContentEditableNewline();
      }
      return;
    }
    const selected = selectedItem();
    const isSubtopicCode = selected?.type === 'subtopic' && selected.item.language !== 'text';
    if (event.key === 'Tab') {
      event.preventDefault();
      event.shiftKey ? unindentTextareaSelection() : indentTextareaSelection();
      return;
    }
    if (event.key === 'Enter') {
      if (isSubtopicCode) {
        event.preventDefault();
        smartTextareaEnter();
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      toggleTextareaComment();
      return;
    }
    if (isSubtopicCode && !event.ctrlKey && !event.metaKey && !event.altKey) autoClosePair(event);
  }

  function insertContentEditableNewline() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    if (!range.collapsed) range.collapse(false);
    let styleNode = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer.closest?.('span[style]')
      : range.startContainer.parentElement?.closest('span[style]');
    while (styleNode?.parentElement?.closest('span[style]') && editor.contains(styleNode.parentElement.closest('span[style]'))) {
      styleNode = styleNode.parentElement.closest('span[style]');
    }
    if (styleNode && editor.contains(styleNode)) {
      range.setStartAfter(styleNode);
      range.collapse(true);
    }
    range.deleteContents();
    const newline = document.createTextNode('\n');
    range.insertNode(newline);
    range.setStartAfter(newline);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    savedEditorSelection = null;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    updateCursor();
  }

  function smartTextareaEnter() {
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const line = before.split(/\r\n|\r|\n/).pop();
    const baseIndent = line.match(/^\s*/)[0];
    const unit = ' '.repeat(settings.tabSize);
    if (before.endsWith('{') && after.startsWith('}')) {
      editor.setRangeText(`\n${baseIndent}${unit}\n${baseIndent}`, start, end, 'end');
      editor.selectionStart = start + 1 + baseIndent.length + unit.length;
      editor.selectionEnd = editor.selectionStart;
    } else if (before.endsWith('{')) {
      editor.setRangeText(`\n${baseIndent}${unit}`, start, end, 'end');
    } else {
      editor.setRangeText(`\n${baseIndent}`, start, end, 'end');
    }
    editor.dispatchEvent(new Event('input'));
  }

  function autoClosePair(event) {
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (!pairs[event.key]) return;
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (event.key === '}' && editor.value[start] === '}') {
      editor.selectionStart = start + 1;
      editor.selectionEnd = start + 1;
      return;
    }
    editor.setRangeText(`${event.key}${pairs[event.key]}`, start, end, 'end');
    editor.selectionStart = start + 1;
    editor.selectionEnd = start + 1;
    editor.dispatchEvent(new Event('input'));
  }

  function indentTextareaSelection() {
    const spaces = ' '.repeat(settings.tabSize);
    editor.setRangeText(spaces, editor.selectionStart, editor.selectionEnd, 'end');
    editor.dispatchEvent(new Event('input'));
  }

  function unindentTextareaSelection() {
    const start = editor.selectionStart;
    const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
    const removable = editor.value.slice(lineStart, lineStart + settings.tabSize).match(/^ {1,8}/)?.[0] || '';
    if (!removable) return;
    editor.setRangeText('', lineStart, lineStart + Math.min(removable.length, settings.tabSize), 'start');
    editor.dispatchEvent(new Event('input'));
  }

  function toggleTextareaComment() {
    const token = commentToken();
    const start = editor.value.lastIndexOf('\n', editor.selectionStart - 1) + 1;
    const nextBreak = editor.value.indexOf('\n', editor.selectionEnd);
    const end = nextBreak === -1 ? editor.value.length : nextBreak;
    const lines = editor.value.slice(start, end).split('\n');
    const uncomment = lines.every((line) => line.trimStart().startsWith(token.trim()));
    const changed = lines.map((line) => {
      if (!uncomment) return `${token}${line}`;
      const index = line.indexOf(token.trim());
      return index === -1 ? line : line.slice(0, index) + line.slice(index + token.trim().length).replace(/^ /, '');
    }).join('\n');
    editor.setRangeText(changed, start, end, 'select');
    editor.dispatchEvent(new Event('input'));
  }

  function indentCodeMirror(cmInstance) {
    if (cmInstance.somethingSelected()) cmInstance.execCommand('indentMore');
    else cmInstance.replaceSelection(' '.repeat(settings.tabSize), 'end');
  }

  function unindentCodeMirror(cmInstance) {
    cmInstance.execCommand('indentLess');
  }

  function smartCodeMirrorEnter(cmInstance) {
    const cursor = cmInstance.getCursor();
    const line = cmInstance.getLine(cursor.line);
    const before = line.slice(0, cursor.ch);
    const after = line.slice(cursor.ch);
    const baseIndent = before.match(/^\s*/)[0];
    const unit = ' '.repeat(settings.tabSize);
    if (before.endsWith('{') && after.startsWith('}')) {
      cmInstance.replaceSelection(`\n${baseIndent}${unit}\n${baseIndent}`, 'end');
      cmInstance.setCursor({ line: cursor.line + 1, ch: baseIndent.length + unit.length });
    } else if (before.endsWith('{')) {
      cmInstance.replaceSelection(`\n${baseIndent}${unit}`, 'end');
    } else {
      cmInstance.execCommand('newlineAndIndent');
    }
  }

  function toggleCodeMirrorComment(cmInstance) {
    const token = commentToken();
    const selections = cmInstance.listSelections();
    const fromLine = selections[0].from().line;
    const toLine = selections[0].to().line;
    const lines = [];
    for (let line = fromLine; line <= toLine; line++) lines.push(cmInstance.getLine(line));
    const uncomment = lines.every((line) => line.trimStart().startsWith(token.trim()));
    cmInstance.operation(() => {
      for (let line = fromLine; line <= toLine; line++) {
        const content = cmInstance.getLine(line);
        if (!uncomment) cmInstance.replaceRange(token, { line, ch: 0 });
        else {
          const index = content.indexOf(token.trim());
          if (index >= 0) cmInstance.replaceRange('', { line, ch: index }, { line, ch: index + token.trim().length + (content[index + token.trim().length] === ' ' ? 1 : 0) });
        }
      }
    });
  }

  function commentToken() {
    const selected = selectedItem();
    const language = selected?.item.language;
    if (language === 'python' || language === 'yaml') return '# ';
    if (language === 'sql') return '-- ';
    if (language === 'html' || language === 'xml') return '<!-- ';
    if (language === 'css') return '/* ';
    return '// ';
  }

  function gotoLinePrompt(cmInstance) {
    const answer = window.prompt('Go to line:', '1');
    if (!answer) return;
    const line = Number(answer) - 1;
    if (!Number.isFinite(line) || line < 0 || line >= cmInstance.lineCount()) return;
    cmInstance.setCursor({ line, ch: 0 });
    cmInstance.focus();
  }

  function cmDuplicateLine(cmInstance) {
    const cursor = cmInstance.getCursor();
    const line = cmInstance.getLine(cursor.line);
    cmInstance.replaceRange(`\n${line}`, { line: cursor.line, ch: cmInstance.getLineLength(cursor.line) });
    cmInstance.setCursor({ line: cursor.line + 1, ch: cursor.ch });
  }

  function modeForLanguage(language) {
    if (language === 'javascript') return 'javascript';
    if (language === 'typescript') return 'application/typescript';
    if (language === 'python') return 'python';
    if (language === 'html') return 'htmlmixed';
    if (language === 'css') return 'css';
    if (language === 'java') return 'text/x-java';
    if (language === 'cpp') return 'text/x-c++src';
    if (language === 'c') return 'text/x-csrc';
    if (language === 'markdown') return 'markdown';
    if (language === 'json') return { name: 'javascript', json: true };
    if (language === 'xml') return 'xml';
    if (language === 'sql') return 'sql';
    if (language === 'yaml') return 'yaml';
    return null;
  }

  async  function changeEditorLanguage() {
    /* Split view: the language of the panel you are in, and only that note. */
    if (splitState && activePane === 'right') {
      const item = resolveRef(splitRefKey())?.item;
      if (!item) return;
      if (elements.language.value !== 'text' && item.richText) {
        item.note = richTextToPlainText(item.note);
        item.richText = false;
      }
      item.language = elements.language.value;
      item.updatedAt = new Date().toISOString();
      renderSplitPane();
      setActivePane('right');
      renderTopicList();
      saveNow();
      return;
    }
    const selected = selectedItem();
    if (!selected) return;
    if (elements.language.value !== 'text' && selected.item.richText) {
      selected.item.note = richTextToPlainText(selected.item.note);
      selected.item.richText = false;
    }
    selected.item.language = elements.language.value;
    selected.item.updatedAt = new Date().toISOString();
    selected.topic.updatedAt = selected.item.updatedAt;
    renderEditor();
    renderTopicList();
    saveNow();
  }

  function richTextToPlainText(html) {
    const container = document.createElement('div');
    container.innerHTML = html || '';
    const blockElements = new Set(['ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DIV', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'HEADER', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'UL']);

    const textFromNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      if (node.tagName === 'BR') return '\n';
      return Array.from(node.childNodes, textFromNode).join('');
    };

    return Array.from(container.childNodes).reduce((text, node, index, nodes) => {
      const nodeText = textFromNode(node);
      const needsLineBreak = blockElements.has(node.tagName)
        && index < nodes.length - 1
        && !nodeText.endsWith('\n');
      return text + nodeText + (needsLineBreak ? '\n' : '');
    }, '');
  }

  function isEmptyRichText(html) {
    if (!String(html || '').trim()) return true;
    const container = document.createElement('div');
    container.innerHTML = String(html || '');
    const text = richTextToPlainText(html).replace(/\u200B/g, '').trim();
    return !text && !container.querySelector('img, video, audio, iframe, canvas, svg');
  }

  function normalizeRichEditorValue(root) {
    if (!root?.isContentEditable) return '';
    const html = root.innerHTML || '';
    if (!isEmptyRichText(html)) return html;
    if (html) root.innerHTML = '';
    return '';
  }

  function notePlainText(item) {
    return item?.richText ? richTextToPlainText(item.note) : (item?.note || '');
  }

  function handleTopicListClick(event) {
    const topicCard = event.target.closest('[data-topic-id]');
    if (!topicCard) return;
    const topicId = topicCard.dataset.topicId;
    const subtopicId = topicCard.dataset.subtopicId;
    const topic = topics.find((item) => item.id === topicId);
    if (!topic) return;

    if (event.target.closest('[data-toggle-topic]')) {
      closeTopicMenus();
      toggleExpanded(topicId);
      return;
    }
    if (event.target.closest('[data-menu]')) {
      const actions = topicCard.querySelector('[data-actions]');
      const willOpen = !actions.classList.contains('open');
      closeTopicMenus();
      actions.classList.toggle('open', willOpen);
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action) {
      const subtopic = subtopicId ? topic.subtopics.find((item) => item.id === subtopicId) : null;
      closeTopicMenus();
      handleTopicAction(action, topic, subtopic);
      return;
    }

    closeTopicMenus();
    if (subtopicId) selectSubtopic(topicId, subtopicId);
    else selectTopic(topicId);
  }

  function closeTopicMenus() {
    document.querySelectorAll('[data-actions].open').forEach((menu) => menu.classList.remove('open'));
  }

  function closeTopicMenusOnOutsidePointer(event) {
    if (!event.target.closest('[data-actions], [data-menu]')) closeTopicMenus();
  }

  function handleTopicAction(action, topic, subtopic) {
    if (action === 'addSubtopic') openSubtopicModal(topic);
    else if (action === 'renameTopic') openTopicModal('renameTopic', topic);
    else if (action === 'duplicateTopic') duplicateTopic(topic);
    else if (action === 'deleteTopic') confirmDeleteTopic(topic);
    else if (action === 'archiveTopic') archiveTopic(topic);
    else if (action === 'renameToTemplate') {
      const template = TEMPLATES.find((option) => option.id === topic.templateId);
      if (!template) return;
      topic.note = template.content;
      topic.templateId = undefined;
      topic.updatedAt = new Date().toISOString();
      render();
    }
    else if (action === 'renameSubtopic') openSubtopicModal(topic, subtopic);
    else if (action === 'duplicateSubtopic') duplicateSubtopic(topic, subtopic);
    else if (action === 'deleteSubtopic') confirmDeleteSubtopic(topic, subtopic);
  }

  function handleRecentClick(event) {
    const button = event.target.closest('[data-recent-ref]');
    if (!button) return;
    const ref = parseRef(button.dataset.recentRef);
    if (ref.type === 'topic') selectTopic(ref.topicId);
    else selectSubtopic(ref.topicId, ref.subtopicId);
    closeRecentPanel();
  }

  function handleNoteTabsClick(event) {
    const close = event.target.closest('[data-close-tab]');
    const tab = event.target.closest('[data-note-tab]');
    if (!tab) return;
    const ref = close?.dataset.closeTab || tab.dataset.noteTab;
    if (close) {
      closeOpenTab(ref);
      return;
    }
    const parsed = parseRef(ref);
    /* Tabs follow the pane the user last clicked: with the right panel active
       the tab replaces that panel's note; otherwise it opens in the main
       editor — same routing as the sidebar notes list. */
    if (parsed.type === 'subtopic') selectSubtopic(parsed.topicId, parsed.subtopicId);
    else selectTopic(parsed.topicId);
  }

  function handleNoteTabsContextMenu(event) {
    if (!isDesktopLayout() || openTabs.length < 2) return;
    const tab = event.target.closest('[data-note-tab]');
    if (!tab) return;
    event.preventDefault();
    contextNoteTabRef = tab.dataset.noteTab || '';
    const menu = elements.noteTabContextMenu;
    menu.classList.remove('hidden');
    const margin = 8;
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.min(event.clientX, window.innerWidth - rect.width - margin)}px`;
    menu.style.top = `${Math.min(event.clientY, window.innerHeight - rect.height - margin)}px`;
  }

  function closeNoteTabContextMenu(event) {
    if (event?.target?.closest('#noteTabContextMenu')) return;
    contextNoteTabRef = '';
    elements.noteTabContextMenu.classList.add('hidden');
  }

  function handleLayoutResize() {
    closeNoteTabContextMenu();
    if (!isDesktopLayout()) {
      markdownPreviewOpen = false;
      updateMarkdownPreview();
      /* Narrow layout hides the right panel: never leave it marked active or
         toolbar/insert actions would target an invisible editor. */
      if (splitState && activePane !== 'left') setActivePane('left');
    } else {
      renderNoteTabs();
    }
    sizeMobileHomeList();
  }

  function splitContextNoteTab() {
    if (!isDesktopLayout() || openTabs.length < 2 || !contextNoteTabRef) {
      closeNoteTabContextMenu();
      return;
    }
    const ref = parseRef(contextNoteTabRef);
    if (ref) {
      if (ref.type === 'subtopic') selectSubtopic(ref.topicId, ref.subtopicId, 'main');
      else selectTopic(ref.topicId, 'main');
      markdownPreviewOpen = false;
      toggleMarkdownPreview();
    }
    closeNoteTabContextMenu();
  }

  function openLockModal() {
    const selected = selectedItem();
    if (!selected || selected.item.locked) return;
    modalAction = { action: 'lockNote' };
    openModal({
      title: 'Lock this note',
      description: 'Choose a numeric PIN. The note stays locked until you unlock it with this PIN.',
      icon: '<i class="fa-solid fa-lock"></i>',
      confirm: 'Lock note',
      inputType: 'password',
      pinOnly: true
    });
  }

  function openUnlockModal() {
    const selected = selectedItem();
    if (!selected?.item.locked) return;
    const pinOnly = selected.item.vault?.credentialType === 'pin';
    modalAction = { action: 'unlockNote' };
    openModal({
      title: 'Unlock note',
      description: pinOnly ? 'Enter the numeric PIN used to protect this note.' : 'Enter the password used to protect this note.',
      icon: '<i class="fa-solid fa-key"></i>',
      confirm: 'Unlock note',
      inputType: 'password',
      pinOnly
    });
  }

  function bytesToBase64(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function base64ToBytes(value) {
    return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  }

  async function deriveVaultKey(password, salt, iterations) {
    if (!crypto?.subtle) throw new Error('Encryption is unavailable in this app context.');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptVaultPayload(payload, password) {
    const iterations = 150000;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveVaultKey(password, salt, iterations);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
    return { version: 1, credentialType: 'pin', algorithm: 'AES-GCM', iterations, salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(encrypted)) };
  }

  async function decryptVaultPayload(vault, password) {
    if (!vault || vault.version !== 1 || vault.algorithm !== 'AES-GCM') throw new Error('Unsupported locked note.');
    const salt = base64ToBytes(vault.salt);
    const iv = base64ToBytes(vault.iv);
    const key = await deriveVaultKey(password, salt, Number(vault.iterations) || 150000);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(vault.data));
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  async function lockCurrentNote(password) {
    const selected = selectedItem();
    if (!selected) return;
    if (!/^\d{4,12}$/.test(String(password || ''))) {
      elements.formError.textContent = 'Use a numeric PIN with 4 to 12 digits.';
      return;
    }
    try {
      const item = selected.item;
      const payload = {
        title: item.title,
        note: item.note || '',
        language: item.language || 'text',
        editorTheme: item.editorTheme || '',
        richText: Boolean(item.richText),
        editorFontSize: item.editorFontSize,
        wordWrap: item.wordWrap,
        textColors: Array.isArray(item.textColors) ? item.textColors : [],
        imageDimensions: item.imageDimensions || {},
        imageAlignments: item.imageAlignments || {}
      };
      item.vault = await encryptVaultPayload(payload, String(password));
      item.locked = true;
      item.title = 'Locked note';
      item.note = '';
      item.language = 'text';
      item.editorTheme = 'plain';
      item.richText = false;
      item.textColors = [];
      item.updatedAt = new Date().toISOString();
      if (selected.type === 'subtopic') selected.topic.updatedAt = item.updatedAt;
      closeModal();
      render();
    } catch (error) {
      elements.formError.textContent = error.message || 'Could not encrypt this note.';
    }
  }

  async function unlockCurrentNote(password) {
    const selected = selectedItem();
    if (!selected?.item.locked) return closeModal();
    const pinOnly = selected.item.vault?.credentialType === 'pin';
    if (pinOnly && !/^\d{4,12}$/.test(String(password || ''))) {
      elements.formError.textContent = 'Enter the 4 to 12 digit PIN.';
      return;
    }
    try {
      const payload = await decryptVaultPayload(selected.item.vault, String(password || ''));
      if (!payload || typeof payload.title !== 'string' || typeof payload.note !== 'string') throw new Error('Invalid note data.');
      const item = selected.item;
      item.title = cleanTitle(payload.title) || 'Untitled';
      item.note = payload.note;
      item.language = validSubtopicLanguage(payload.language || 'text');
      item.editorTheme = validEditorTheme(payload.editorTheme);
      item.editorFontSize = validFontSize(payload.editorFontSize);
      item.wordWrap = typeof payload.wordWrap === 'boolean' ? payload.wordWrap : undefined;
      item.richText = Boolean(payload.richText);
      item.textColors = Array.isArray(payload.textColors) ? payload.textColors : [];
      item.imageDimensions = validIdMap(payload.imageDimensions);
      item.imageAlignments = validIdMap(payload.imageAlignments);
      item.locked = false;
      delete item.vault;
      closeModal();
      render();
    } catch (_) {
      elements.formError.textContent = 'Incorrect password or damaged vault data.';
      elements.modalInput.select();
    }
  }

  function openTabForRef(ref) {
    if (!isDesktopLayout()) return;
    const key = refToString(ref);
    if (!key || !resolveRef(key)) return;
    openTabs = unique([...openTabs, key]);
    safeSetRaw(KEYS.tabs, JSON.stringify(openTabs));
  }

  function closeOpenTab(ref) {
    const index = openTabs.indexOf(ref);
    if (index === -1) return;
    const wasActive = refToString(selectedRef) === ref;
    openTabs = openTabs.filter((item) => item !== ref);
    if (wasActive) {
      const nextRef = openTabs[index] || openTabs[index - 1] || '';
      selectedRef = nextRef ? parseRef(nextRef) : { type: 'topic', topicId: '' };
    }
    safeSetRaw(KEYS.tabs, JSON.stringify(openTabs));
    /* Closing the very last tab tears split view down with it, so the workspace
       returns to a plain empty editor. Nothing about the old layout is saved:
       the next note a click opens comes up in a single panel again. */
    if (!openTabs.length && splitState) closeSplitView();
    render();
  }

  function openTopicModal(action, topic = null) {
    modalAction = { action, topicId: topic?.id || '' };
    openModal({
      title: action === 'createTopic' ? 'New topic' : 'Rename topic',
      description: action === 'createTopic' ? 'Give your main topic a clear name.' : 'Choose a new main topic name.',
      icon: action === 'createTopic' ? '<i class="fa-solid fa-folder-plus"></i>' : '<i class="fa-solid fa-pen"></i>',
      confirm: action === 'createTopic' ? 'Create topic' : 'Rename topic',
      value: topic?.title || '',
      /* New notes always open empty. Templates remain available through the
         existing Insert template action after the note is created. */
      showTemplatePicker: false
    });
  }

  function openSubtopicModal(topic, subtopic = null) {
    modalAction = {
      action: subtopic ? 'renameSubtopic' : 'addSubtopic',
      topicId: topic.id,
      subtopicId: subtopic?.id || ''
    };
    openModal({
      title: subtopic ? 'Rename subtopic' : 'Add subtopic',
      description: subtopic ? 'Choose a new subtopic name.' : `Add a subtopic under "${topic.title}".`,
      icon: '<i class="fa-solid fa-diagram-project"></i>',
      confirm: subtopic ? 'Rename subtopic' : 'Add subtopic',
      value: subtopic?.title || ''
    });
  }

  function confirmDeleteTopic(topic) {
    modalAction = { action: 'deleteTopic', topicId: topic.id };
    openModal({
      title: 'Delete this topic?',
      description: `"${topic.title}" and all subtopics will be removed from this browser.`,
      icon: '<i class="fa-regular fa-trash-can"></i>',
      confirm: 'Delete topic',
      noInput: true
    });
  }

  function confirmDeleteSubtopic(topic, subtopic) {
    modalAction = { action: 'deleteSubtopic', topicId: topic.id, subtopicId: subtopic.id };
    openModal({
      title: 'Delete this subtopic?',
      description: `"${subtopic.title}" will be removed from "${topic.title}".`,
      icon: '<i class="fa-regular fa-trash-can"></i>',
      confirm: 'Delete subtopic',
      noInput: true
    });
  }

  function openModal(options) {
    elements.modalTitle.textContent = options.title;
    elements.modalDescription.textContent = options.description;
    elements.modalIcon.innerHTML = options.icon;
    elements.modalConfirm.textContent = options.confirm;
    elements.modalCancel.textContent = options.hideCancel ? '' : 'Cancel';
    elements.modalCancel.classList.toggle('hidden', Boolean(options.hideCancel));
    elements.modalInputWrap.classList.toggle('hidden', Boolean(options.noInput));
    const templateSelect = $('#modalTemplateSelect');
    if (templateSelect) {
      templateSelect.classList.toggle('hidden', !options.showTemplatePicker);
      templateSelect.innerHTML = TEMPLATES.map((template) => `<option value="${template.id}">${template.title}</option>`).join('');
    }
    elements.modalInput.value = options.value || '';
    elements.modalInput.type = options.inputType || 'text';
    elements.modalInput.inputMode = options.pinOnly ? 'numeric' : '';
    elements.modalInput.pattern = options.pinOnly ? '[0-9]*' : '';
    elements.modalInput.minLength = options.pinOnly ? 4 : 0;
    elements.modalInput.maxLength = options.pinOnly ? 12 : 120;
    elements.modalInput.placeholder = options.pinOnly ? '4–12 digit PIN' : '';
    elements.modalInput.dataset.pinOnly = options.pinOnly ? 'true' : 'false';
    elements.formError.textContent = '';
    elements.modal.classList.add('show');
    elements.modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => options.noInput ? elements.modalConfirm.focus() : elements.modalInput.focus(), 50);
  }

  function closeModal() {
    elements.modal.classList.remove('show');
    elements.modal.setAttribute('aria-hidden', 'true');
    modalAction = null;
    elements.modalInput.type = 'text';
    elements.modalInput.inputMode = '';
    elements.modalInput.pattern = '';
    elements.modalInput.minLength = 0;
    elements.modalInput.maxLength = 120;
    elements.modalInput.placeholder = '';
    elements.modalInput.dataset.pinOnly = 'false';
  }

  async function confirmModal() {
    if (!modalAction) return closeModal();
    const topic = topics.find((item) => item.id === modalAction.topicId);
    const subtopic = topic?.subtopics.find((item) => item.id === modalAction.subtopicId);
    if (modalAction.action === 'restoreDrafts') restoreDrafts();
    else if (modalAction.action === 'createTopic') {
      createTopic(elements.modalInput.value);
    }
    else if (modalAction.action === 'renameTopic' && topic) renameTopic(topic, elements.modalInput.value);
    else if (modalAction.action === 'addSubtopic' && topic) createSubtopic(topic, elements.modalInput.value);
    else if (modalAction.action === 'renameSubtopic' && topic && subtopic) renameSubtopic(topic, subtopic, elements.modalInput.value);
    else if (modalAction.action === 'deleteTopic' && topic) moveToTrash(topic);
    else if (modalAction.action === 'deleteSubtopic' && topic && subtopic) deleteSubtopic(topic, subtopic);
    else if (modalAction.action === 'confirmImportWord' && modalAction.title) finishWordImport(modalAction.title, modalAction.html);
    else if (modalAction.action === 'lockNote') await lockCurrentNote(elements.modalInput.value);
    else if (modalAction.action === 'unlockNote') await unlockCurrentNote(elements.modalInput.value);
    else closeModal();
  }

  function createTopic(title, note = '') {
    const cleaned = cleanTitle(title);
    if (!cleaned) return showError('Please enter a topic title.');
    if (hasDuplicateTopic(cleaned)) return showError('Topic already exists.');
    const now = new Date().toISOString();
    const topic = { id: uid(), title: cleaned, note: String(note || ''), language: 'text', createdAt: now, updatedAt: now, favorite: false, pinned: false, subtopics: [] };
    topics.push(topic);
    selectedRef = { type: 'topic', topicId: topic.id };
    expanded = unique([...expanded, topic.id]);
    touchRecent(refToString(selectedRef));
    closeModal();
    render();
  }

  function renameTopic(topic, title) {
    const cleaned = cleanTitle(title);
    if (!cleaned) return showError('Please enter a topic title.');
    if (hasDuplicateTopic(cleaned, topic.id)) return showError('Topic already exists.');
    topic.title = cleaned;
    topic.updatedAt = new Date().toISOString();
    closeModal();
    render();
  }

  function createSubtopic(topic, title, note = '', language = '') {
    const cleaned = cleanTitle(title);
    if (!cleaned) return showError('Please enter a subtopic name.');
    if (hasDuplicateSubtopic(topic, cleaned)) return showError('Subtopic already exists under this topic.');
    const now = new Date().toISOString();
    const resolvedLanguage = validSubtopicLanguage(language || detectLanguage(cleaned));
    const subtopic = { id: uid(), title: cleaned, note: String(note || ''), language: resolvedLanguage, createdAt: now, updatedAt: now };
    topic.subtopics.push(subtopic);
    topic.updatedAt = now;
    selectedRef = { type: 'subtopic', topicId: topic.id, subtopicId: subtopic.id };
    expanded = unique([...expanded, topic.id]);
    touchRecent(refToString(selectedRef));
    closeModal();
    render();
  }

  function renameSubtopic(topic, subtopic, title) {
    const cleaned = cleanTitle(title);
    if (!cleaned) return showError('Please enter a subtopic name.');
    if (hasDuplicateSubtopic(topic, cleaned, subtopic.id)) return showError('Subtopic already exists under this topic.');
    subtopic.title = cleaned;
    subtopic.updatedAt = new Date().toISOString();
    topic.updatedAt = subtopic.updatedAt;
    closeModal();
    render();
  }

  function deleteTopic(topic) {
    topics = topics.filter((item) => item.id !== topic.id);
    recents = recents.filter((ref) => parseRef(ref).topicId !== topic.id);
    expanded = expanded.filter((id) => id !== topic.id);
    if (selectedRef.topicId === topic.id) selectedRef = topics.length ? { type: 'topic', topicId: sortedTopics(topics)[0].id } : { type: 'topic', topicId: '' };
    closeModal();
    render();
  }

  function deleteSubtopic(topic, subtopic) {
    topic.subtopics = topic.subtopics.filter((item) => item.id !== subtopic.id);
    recents = recents.filter((ref) => ref !== refToString({ type: 'subtopic', topicId: topic.id, subtopicId: subtopic.id }));
    if (selectedRef.type === 'subtopic' && selectedRef.subtopicId === subtopic.id) selectedRef = { type: 'topic', topicId: topic.id };
    topic.updatedAt = new Date().toISOString();
    closeModal();
    render();
  }

  function duplicateTopic(topic) {
    let title = `${topic.title} copy`;
    let number = 2;
    while (hasDuplicateTopic(title)) title = `${topic.title} copy ${number++}`;
    const now = new Date().toISOString();
    const copy = {
      ...topic,
      id: uid(),
      title,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic, id: uid(), createdAt: now, updatedAt: now }))
    };
    topics.push(copy);
    selectedRef = { type: 'topic', topicId: copy.id };
    expanded = unique([...expanded, copy.id]);
    touchRecent(refToString(selectedRef));
    render();
  }

  function duplicateSubtopic(topic, subtopic) {
    let title = `${subtopic.title} copy`;
    let number = 2;
    while (hasDuplicateSubtopic(topic, title)) title = `${subtopic.title} copy ${number++}`;
    const now = new Date().toISOString();
    const copy = { ...subtopic, id: uid(), title, createdAt: now, updatedAt: now };
    topic.subtopics.push(copy);
    topic.updatedAt = now;
    selectedRef = { type: 'subtopic', topicId: topic.id, subtopicId: copy.id };
    expanded = unique([...expanded, topic.id]);
    touchRecent(refToString(selectedRef));
    render();
  }

  function deleteCurrentItem() {
    const selected = selectedItem();
    if (!selected) return;
    if (selected.type === 'topic') confirmDeleteTopic(selected.topic);
    else confirmDeleteSubtopic(selected.topic, selected.item);
  }

  /* With split view open, a note clicked in the left panel (sidebar tree or
     Recent) loads into the pane the user last clicked: with the right panel
     active it replaces the right-hand note and the left editor is untouched —
     and vice versa. Returns true when the click was consumed by the right
     pane. No full render() runs here, so the other pane keeps its editor
     instance, cursor and scroll position. */
  function openNoteInRightPane(ref) {
    /* Mobile / narrow layout: #splitPane is display:none, so a click must never
       be consumed into an invisible panel — same guard openSplitView uses. */
    if (!isDesktopLayout()) return false;
    const key = refToString(ref);
    if (!resolveRef(key)) return false;
    splitState.ref = key;
    if (ref.type === 'subtopic') expanded = unique([...expanded, ref.topicId]);
    openTabForRef(ref);
    touchRecent(key);
    closeSidebar();
    renderTopicList();
    renderNoteTabs();
    renderSplitPane();
    refreshSplitPaneHeader();
    setActivePane('right');
    return true;
  }

  /* pane = 'main' forces the single/left editor even while the right panel is
     active — used by drag-and-drop handling and pane-close promotion, which
     address the main editor explicitly. Tab clicks use 'auto' so they follow
     the last-activated pane. */
  function selectTopic(topicId, pane = 'auto') {
    if (pane !== 'main' && splitState && activePane === 'right' && openNoteInRightPane({ type: 'topic', topicId })) return;
    selectedRef = { type: 'topic', topicId };
    openTabForRef(selectedRef);
    touchRecent(refToString(selectedRef));
    closeSidebar();
    render();
  }

  function selectSubtopic(topicId, subtopicId, pane = 'auto') {
    if (pane !== 'main' && splitState && activePane === 'right' && openNoteInRightPane({ type: 'subtopic', topicId, subtopicId })) return;
    selectedRef = { type: 'subtopic', topicId, subtopicId };
    openTabForRef(selectedRef);
    expanded = unique([...expanded, topicId]);
    touchRecent(refToString(selectedRef));
    closeSidebar();
    render();
  }

  function toggleTopicFlag(flag) {
    const selected = selectedItem();
    if (!selected || selected.type !== 'topic') return;
    selected.item[flag] = !selected.item[flag];
    selected.item.updatedAt = new Date().toISOString();
    render();
  }

  function toggleExpanded(topicId) {
    expanded = expanded.includes(topicId) ? expanded.filter((id) => id !== topicId) : [...expanded, topicId];
    saveNow();
    renderTopicList();
  }

  function openSearch(showReplace) {
    elements.searchPanel.classList.remove('hidden');
    elements.searchPanel.classList.toggle('replace-open', showReplace);
    updateSearch();
    setTimeout(() => (showReplace ? elements.replaceInput : elements.findInput).focus(), 50);
  }

  function closeSearch() {
    elements.searchPanel.classList.add('hidden');
  }

  function updateSearch() {
    const matches = getMatches();
    elements.searchCount.textContent = `${matches.length} results`;
    if (!matches.length) searchMatchIndex = -1;
  }

  function getEditorValue() {
    if (codeMirror) return codeMirror.getValue();
    return editor ? (editor.isContentEditable ? richTextToPlainText(editor.innerHTML) : editor.value) : '';
  }

  function setEditorValue(value) {
    if (codeMirror) codeMirror.setValue(value);
    else if (editor) {
      if (editor.isContentEditable) editor.innerText = value;
      else editor.value = value;
    }
  }

  function getMatches() {
    const query = elements.findInput.value;
    if (!query) return [];
    const matches = [];
    const text = getEditorValue().toLowerCase();
    const needle = query.toLowerCase();
    let index = text.indexOf(needle);
    while (index !== -1) {
      matches.push({ start: index, end: index + query.length });
      index = text.indexOf(needle, index + Math.max(1, query.length));
    }
    return matches;
  }

  function goToMatch(direction) {
    const matches = getMatches();
    if (!matches.length) return;
    searchMatchIndex = (searchMatchIndex + direction + matches.length) % matches.length;
    const match = matches[searchMatchIndex];
    if (codeMirror) {
      const from = codeMirror.posFromIndex(match.start);
      const to = codeMirror.posFromIndex(match.end);
      codeMirror.focus();
      codeMirror.setSelection(from, to);
    } else {
      editor.focus();
      if (editor.isContentEditable) selectRichTextRange(match.start, match.end);
      else editor.setSelectionRange(match.start, match.end);
    }
    updateCursor();
  }

  function replaceOne() {
    const query = elements.findInput.value;
    if (!query) return;
    if (codeMirror) {
      const selectedText = codeMirror.getSelection();
      if (selectedText.toLowerCase() !== query.toLowerCase()) goToMatch(1);
      codeMirror.replaceSelection(elements.replaceInput.value);
    } else {
      if (editor.isContentEditable) {
        const matches = getMatches();
        if (!matches.length) return;
        const match = matches[searchMatchIndex >= 0 ? searchMatchIndex : 0];
        replaceRichTextRange(match.start, match.end, elements.replaceInput.value);
        updateSearch();
        return;
      }
      const selectedText = editor.value.slice(editor.selectionStart, editor.selectionEnd);
      if (selectedText.toLowerCase() !== query.toLowerCase()) goToMatch(1);
      editor.setRangeText(elements.replaceInput.value, editor.selectionStart, editor.selectionEnd, 'end');
      editor.dispatchEvent(new Event('input'));
    }
    updateSearch();
  }

  function replaceAllMatches() {
    const query = elements.findInput.value;
    if (!query) return;
    if (editor?.isContentEditable) {
      replaceAllRichText(query, elements.replaceInput.value);
      updateSearch();
      return;
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    setEditorValue(getEditorValue().replace(new RegExp(escaped, 'gi'), elements.replaceInput.value));
    commitEditorValue(getEditorValue());
    updateSearch();
  }

  function richTextNodes() {
    if (!editor?.isContentEditable) return [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function selectRichTextRange(start, end) {
    let offset = 0;
    let startPoint = null;
    let endPoint = null;
    richTextNodes().forEach((node) => {
      const next = offset + node.data.length;
      if (!startPoint && start >= offset && start <= next) startPoint = { node, offset: start - offset };
      if (!endPoint && end >= offset && end <= next) endPoint = { node, offset: end - offset };
      offset = next;
    });
    if (!startPoint || !endPoint) return;
    const range = document.createRange();
    range.setStart(startPoint.node, startPoint.offset);
    range.setEnd(endPoint.node, endPoint.offset);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function replaceRichTextRange(start, end, replacement) {
    selectRichTextRange(start, end);
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const text = document.createTextNode(replacement);
    range.insertNode(text);
    range.setStartAfter(text);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    commitEditorValue(editor.innerHTML);
  }

  function replaceAllRichText(query, replacement) {
    const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let changed = false;
    richTextNodes().forEach((node) => {
      if (!expression.test(node.data)) return;
      expression.lastIndex = 0;
      node.data = node.data.replace(expression, replacement);
      expression.lastIndex = 0;
      changed = true;
    });
    if (changed) commitEditorValue(editor.innerHTML);
  }

  function activeCodeMirror() {
    return splitState && activePane === 'right' ? splitCodeMirror : codeMirror;
  }

  function activeRichEditor() {
    return splitState && activePane === 'right' ? splitEditorEl : editor;
  }

  function undoEditor() {
    const instance = activeCodeMirror();
    if (instance) { instance.undo(); return; }
    const target = activeRichEditor();
    if (!target?.isContentEditable) return;
    target.focus();
    document.execCommand('undo');
    syncEditorAfterHistory(target);
  }

  function redoEditor() {
    const instance = activeCodeMirror();
    if (instance) { instance.redo(); return; }
    const target = activeRichEditor();
    if (!target?.isContentEditable) return;
    target.focus();
    document.execCommand('redo');
    syncEditorAfterHistory(target);
  }

  /* Undo/redo on a rich pane does not always emit an input event, so the pane's
     value is committed explicitly — to the note that pane owns. */
  function syncEditorAfterHistory(target) {
    if (!target?.isContentEditable) return;
    if (splitState && activePane === 'right' && target === splitEditorEl) {
      const value = normalizeRichEditorValue(target);
      commitSplitValue(value, Boolean(value));
      updateCursor();
      return;
    }
    handleTextareaInput();
  }

  function updateEditorStats() {
    const text = getEditorValue();
    const lineCount = Math.max(1, text.split(/\r\n|\r|\n/).length);
    elements.words.textContent = text.trim() ? text.trim().split(/\s+/).length : '0';
    elements.chars.textContent = text.length;
    elements.lines.textContent = String(lineCount);
    updateEditorPlaceholder();
    updateCursor();
  }

  function updateEditorPlaceholder() {
    if (!elements.editorHost) return;
    let empty = true;
    if (codeMirror) {
      empty = !codeMirror.getValue();
      codeMirror.getWrapperElement().dataset.placeholder = EDITOR_PLACEHOLDER;
    } else if (editor?.isContentEditable) {
      editor.dataset.placeholder = EDITOR_PLACEHOLDER;
      editor.setAttribute('aria-placeholder', EDITOR_PLACEHOLDER);
      empty = isEmptyRichText(editor.innerHTML);
    } else if (editor) {
      empty = !editor.value;
    }
    elements.editorHost.classList.toggle('editor-empty', empty);
  }

  function updateCursor() {
    if (codeMirror) {
      const cursor = codeMirror.getCursor();
      elements.cursor.textContent = `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
      return;
    }
    if (!editor) return;
    if (editor.isContentEditable) {
      elements.cursor.textContent = 'Rich text';
      return;
    }
    const before = editor.value.slice(0, editor.selectionStart);
    const lines = before.split(/\r\n|\r|\n/);
    elements.cursor.textContent = `Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}`;
  }

  function themeById(id) {
    return APP_THEMES.find((theme) => theme.id === id) || APP_THEMES[1];
  }

  function currentAppTheme() {
    return document.documentElement.getAttribute('data-app-theme') || 'dark';
  }

  function applyAppTheme(themeId) {
    const theme = themeById(themeId);
    document.documentElement.setAttribute('data-app-theme', theme.id);
    document.body.classList.toggle('dark', theme.id === 'dark');
    document.documentElement.classList.toggle('theme-dark', theme.id === 'dark');
    document.documentElement.style.colorScheme = theme.colorScheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.themeColor);
    localStorage.setItem(KEYS.theme, theme.id);
    syncThemeControls(theme);
  }

  function syncThemeControls(theme) {
    const slider = $('#themeSlider');
    if (slider) {
      slider.value = String(theme.number);
      slider.setAttribute('aria-valuetext', `Theme ${theme.number}, ${theme.name}`);
    }
    const label = $('#themeSliderValue');
    if (label) label.textContent = `Theme ${theme.number} · ${theme.name}`;
    document.querySelectorAll('[data-theme-tick]').forEach((tick, index) => {
      tick.classList.toggle('active', index === theme.number - 1);
    });
  }

  function applyEditorTheme(theme) {
    document.body.dataset.editorTheme = theme;
    elements.editorTheme.value = theme;
    localStorage.setItem(KEYS.editorTheme, theme);
    const selected = selectedItem();
    if (selected) {
      selected.item.editorTheme = theme;
      saveNow();
    }
    if (codeMirror) codeMirror.setOption('theme', CODE_MIRROR_THEMES[theme] || 'default');
    /* Keep the left panel's own header in step with the toolbar.
       The right panel is driven by its own note, so it is deliberately not
       touched here — changing one note never repaints the other. */
    const leftThemeSelect = $('#splitLeftTheme');
    if (leftThemeSelect?.dataset.ready) leftThemeSelect.value = theme;
    syncSplitTheme(theme);
  }

  function applyTextColor(color) {
    if (splitState && activePane === 'right') { applySplitTextColor(color); return; }
    const selected = selectedItem();
    if (!selected) return;
    if (codeMirror) {
      if (!codeMirror.somethingSelected()) return;
      const from = codeMirror.getCursor('from');
      const to = codeMirror.getCursor('to');
      const start = codeMirror.indexFromPos(from);
      const end = codeMirror.indexFromPos(to);
      codeColorMarks.push(codeMirror.markText(from, to, { css: `color: ${color}` }));
      selected.item.textColors = [...(selected.item.textColors || []).filter((mark) => mark.end <= start || mark.start >= end), { start, end, color }];
      saveNow();
      return;
    }
    applySelectedTextStyle('color', color);
  }

  function changeSelectedTextSize(direction) {
    if (splitState && activePane === 'right') { changeSplitPaneTextSize(direction); return; }
    const editorSelected = selectedItem();
    const range = getSelectedEditorRange();
    if (!range) {
      /* No selection: size the note itself so the other panels and the other
         notes are untouched. The global default stays in Settings. */
      if (!editorSelected) return;
      setNoteFontSize(editorSelected.item, Math.min(28, Math.max(12, paneFontSize(editorSelected.item) + direction)));
      applyEditorSettings();
      saveNow();
      return;
    }
    const startElement = range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : range.startContainer;
    const currentSize = Number.parseFloat(getComputedStyle(startElement).fontSize) || paneFontSize(editorSelected?.item);
    applySelectedTextStyle('fontSize', `${Math.min(48, Math.max(12, currentSize + direction))}px`);
  }

  /* Matching the global default again drops the override, so the note follows
     the Settings value from then on. */
  function setNoteFontSize(item, next) {
    if (!item) return;
    if (next === settings.fontSize) delete item.editorFontSize; else item.editorFontSize = next;
    item.updatedAt = new Date().toISOString();
  }

  function saveEditorSelection() {
    if (!editor?.isContentEditable) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) savedEditorSelection = range.cloneRange();
  }

  function getSelectedEditorRange() {
    if (!editor?.isContentEditable) return null;
    const selection = window.getSelection();
    const liveRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const range = liveRange && editor.contains(liveRange.commonAncestorContainer)
      ? liveRange
      : savedEditorSelection;
    if (!range || range.collapsed || !editor.contains(range.commonAncestorContainer)) return null;
    if (range === savedEditorSelection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return range;
  }

  function applySelectedTextStyle(property, value) {
    const range = getSelectedEditorRange();
    if (!range) return false;
    const span = document.createElement('span');
    span.style[property] = value;
    try {
      range.surroundContents(span);
    } catch (_) {
      const fragment = range.extractContents();
      span.append(fragment);
      range.insertNode(span);
    }
    const selection = window.getSelection();
    const styledRange = document.createRange();
    styledRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(styledRange);
    savedEditorSelection = styledRange.cloneRange();
    const selected = selectedItem();
    if (selected) {
      selected.item.richText = true;
      commitEditorValue(editor.innerHTML);
    }
    return true;
  }

  /* ── Per-panel appearance helpers ────────────────────────────────────────
     Every formatting tool resolves its target through these, so a change made
     with one panel active can never reach the other note. A note stores its own
     editor theme, font size and word wrap; anything unset follows the app's
     current defaults, which is what makes both panels match when split view
     opens. */
  function paneNoteItem(pane) {
    if (pane === 'right') return splitState ? (resolveRef(splitRefKey())?.item || null) : null;
    return selectedItem()?.item || null;
  }

  function activePaneItem() {
    return paneNoteItem(activePane) || paneNoteItem('left');
  }

  function paneWordWrap(item) {
    if (!item) return settings.wordWrap;
    return typeof item.wordWrap === 'boolean' ? item.wordWrap : settings.wordWrap;
  }

  function paneFontSize(item) {
    const size = Number(item?.editorFontSize);
    return Number.isFinite(size) && size >= 12 && size <= 28 ? size : settings.fontSize;
  }

  function storedEditorTheme(item) {
    return validEditorTheme(item?.editorTheme) || localStorage.getItem(KEYS.editorTheme) || 'plain';
  }

  /* The theme the primary editor is currently painted with. */
  function mainEditorTheme() {
    return validEditorTheme(elements.editorTheme.value) || storedEditorTheme(selectedItem()?.item);
  }

  function syncWordWrapButton() {
    const button = $('#wordWrapButton');
    if (button) button.classList.toggle('active', paneWordWrap(activePaneItem()));
  }

  /* Word wrap stays the global setting in the normal single-note editor; inside
     split view it is written to the active note so the other panel keeps its
     own wrapping. */
  function toggleWordWrapForActivePane() {
    if (!splitState) { updateSetting('wordWrap', !settings.wordWrap); return; }
    const item = activePaneItem();
    if (!item) return;
    const next = !paneWordWrap(item);
    if (next === settings.wordWrap) delete item.wordWrap; else item.wordWrap = next;
    item.updatedAt = new Date().toISOString();
    if (activePane === 'right') applySplitPaneAppearance(); else applyEditorSettings();
    syncWordWrapButton();
    saveNow();
  }

  /* Selection memory follows the active panel, so colour/font tools act on the
     text you highlighted in the panel you highlighted it in. */
  function savePaneSelection() {
    if (splitState && activePane === 'right') { saveSplitPaneSelection(); return; }
    saveEditorSelection();
  }

  function saveSplitPaneSelection() {
    if (!splitEditorEl?.isContentEditable) { savedSplitSelection = null; return; }
    const selection = window.getSelection();
    savedSplitSelection = selection?.rangeCount && splitEditorEl.contains(selection.getRangeAt(0).commonAncestorContainer)
      ? selection.getRangeAt(0).cloneRange()
      : null;
  }

  function getSelectedSplitRange() {
    if (!splitEditorEl?.isContentEditable) return null;
    const selection = window.getSelection();
    const liveRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const range = liveRange && splitEditorEl.contains(liveRange.commonAncestorContainer) ? liveRange : savedSplitSelection;
    if (!range || range.collapsed || !splitEditorEl.contains(range.commonAncestorContainer)) return null;
    if (range === savedSplitSelection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return range;
  }

  function applySplitPaneTextStyle(property, value) {
    const resolved = splitState ? resolveRef(splitRefKey()) : null;
    const range = getSelectedSplitRange();
    if (!resolved || !range || !splitEditorEl) return false;
    const span = document.createElement('span');
    span.style[property] = value;
    try {
      range.surroundContents(span);
    } catch (_) {
      const fragment = range.extractContents();
      span.append(fragment);
      range.insertNode(span);
    }
    const selection = window.getSelection();
    const styledRange = document.createRange();
    styledRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(styledRange);
    savedSplitSelection = styledRange.cloneRange();
    resolved.item.richText = true;
    commitSplitValue(normalizeRichEditorValue(splitEditorEl), true);
    return true;
  }

  /* Color works in both pane kinds: CodeMirror notes keep their marks in the
     note record, rich notes store an inline span in the note HTML. */
  function applySplitTextColor(color) {
    const resolved = splitState ? resolveRef(splitRefKey()) : null;
    if (!resolved) return;
    if (splitCodeMirror) {
      if (!splitCodeMirror.somethingSelected()) return;
      const from = splitCodeMirror.getCursor('from');
      const to = splitCodeMirror.getCursor('to');
      const start = splitCodeMirror.indexFromPos(from);
      const end = splitCodeMirror.indexFromPos(to);
      splitColorMarks.push(splitCodeMirror.markText(from, to, { css: `color: ${color}` }));
      resolved.item.textColors = [...(resolved.item.textColors || []).filter((mark) => mark.end <= start || mark.start >= end), { start, end, color }];
      saveNow();
      return;
    }
    applySplitPaneTextStyle('color', color);
  }

  function changeSplitPaneTextSize(direction) {
    const item = splitState ? resolveRef(splitRefKey())?.item : null;
    if (!item) return;
    const range = getSelectedSplitRange();
    if (!range) {
      setNoteFontSize(item, Math.min(28, Math.max(12, paneFontSize(item) + direction)));
      applySplitPaneAppearance();
      saveNow();
      return;
    }
    const startElement = range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : range.startContainer;
    const currentSize = Number.parseFloat(getComputedStyle(startElement).fontSize) || paneFontSize(item);
    applySplitPaneTextStyle('fontSize', `${Math.min(48, Math.max(12, currentSize + direction))}px`);
  }

  function applyEditorSettings() {
    const mainItem = selectedItem()?.item;
    elements.editorHost.style.setProperty('--editor-font-size', `${paneFontSize(mainItem)}px`);
    if (codeMirror) {
      codeMirror.setOption('lineWrapping', paneWordWrap(mainItem));
      codeMirror.setOption('tabSize', settings.tabSize);
      codeMirror.setOption('indentUnit', settings.tabSize);
      /* Optional chaining: the pane/editor can be torn down (split closed, last
       tab closed) before this timer fires — refresh then has nothing to do. */
    setTimeout(() => codeMirror?.refresh(), 0);
    } else if (editor) {
      editor.style.fontSize = `${paneFontSize(mainItem)}px`;
      editor.style.tabSize = String(settings.tabSize);
      editor.style.whiteSpace = paneWordWrap(mainItem) ? 'pre-wrap' : 'pre';
    }
    syncWordWrapButton();
    syncSplitEditorSettings();
  }

  function updateSetting(key, value) {
    if (key === 'fontSize') settings.fontSize = Math.min(28, Math.max(12, Number(value) || DEFAULT_SETTINGS.fontSize));
    else if (key === 'tabSize') settings.tabSize = Math.min(8, Math.max(2, Number(value) || DEFAULT_SETTINGS.tabSize));
    else settings[key] = Boolean(value);
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
    applySettingsToControls();
    applyEditorSettings();
    saveNow();
  }

  function applySettingsToControls() {
    elements.fontSize.value = settings.fontSize;
    elements.tabSize.value = settings.tabSize;
    elements.wordWrap.checked = settings.wordWrap;
    elements.autosave.checked = settings.autosave;
    if (elements.lineNumbers) elements.lineNumbers.checked = settings.lineNumbers !== false;
    updateStorageReadout();
  }

  function updateStorageReadout() {
    if (!elements.storageUsage) return;
    let bytes = 0;
    try { for (const key of Object.keys(localStorage)) if (key.startsWith('developer-notes-')) bytes += (localStorage.getItem(key) || '').length * 2; } catch (_) {}
    const formatKB = (value) => value < 1024 ? `${value} B` : value < 1024 * 1024 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1048576).toFixed(2)} MB`;
    elements.storageUsage.textContent = formatKB(bytes);
    elements.storageCounts.textContent = `${topics.length} / ${archived.length} / ${trash.length}`;
  }

  function applyLineNumbers() {
    const enabled = settings.lineNumbers !== false;
    if (codeMirror) codeMirror.setOption('lineNumbers', enabled);
  }

  function toggleMarkdownPreview() {
    const selected = selectedItem();
    /* Preview and split view both own the right half of the frame. */
    if (splitState) closeSplitView();
    if (!isDesktopLayout() || !selected || selected.item.language !== 'text' || selected.item.locked) return;
    markdownPreviewOpen = !markdownPreviewOpen;
    updateMarkdownPreview();
  }

  function updateMarkdownPreview() {
    const selected = selectedItem();
    if (!isDesktopLayout()) markdownPreviewOpen = false;
    const show = Boolean(isDesktopLayout() && markdownPreviewOpen && selected && selected.item.language === 'text');
    $('#editorFrame').classList.toggle('preview-split', show);
    $('#previewButton').classList.toggle('active', show);
    elements.markdownPreview.classList.toggle('hidden', !show);
    if (show) elements.markdownPreview.innerHTML = selected.item.richText ? selected.item.note : renderMarkdown(selected.item.note || '');
  }

  function renderMarkdown(markdown) {
    return escapeHtml(markdown)
      .split(/\r?\n/)
      .map((line) => {
        if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
        if (line.startsWith('- ')) return `<p>&bull; ${line.slice(2)}</p>`;
        return line.trim() ? `<p>${line}</p>` : '';
      })
      .join('');
  }

  function toggleFocusMode() {
    if (document.body.classList.contains('focus-mode')) restoreFocusMode();
    else enterFocusMode();
  }

  function enterFocusMode() {
    document.body.classList.add('focus-mode');
    $('#focusButton').classList.add('active');
    $('#focusRestoreButton').classList.remove('hidden');
    setTimeout(() => focusEditor(), 0);
  }

  function restoreFocusMode() {
    document.body.classList.remove('focus-mode');
    $('#focusButton').classList.remove('active');
    $('#focusRestoreButton').classList.add('hidden');
    setTimeout(() => focusEditor(), 0);
  }

  function openSettings() {
    applySettingsToControls();
    elements.settingsLayer.classList.add('show');
    elements.settingsLayer.setAttribute('aria-hidden', 'false');
  }

  /* Recent panel — a Settings-style dialog listing the most recent notes. */
  function openRecentPanel() {
    renderRecentList();
    $('#recentLayer').classList.add('show');
    $('#recentLayer').setAttribute('aria-hidden', 'false');
    closeSidebar(); /* on mobile the drawer would cover the panel */
  }

  function closeRecentPanel() {
    $('#recentLayer').classList.remove('show');
    $('#recentLayer').setAttribute('aria-hidden', 'true');
  }

  function closeSettings() {
    elements.settingsLayer.classList.remove('show');
    elements.settingsLayer.setAttribute('aria-hidden', 'true');
  }

  function openSidebar() {
    elements.sidebar.classList.add('open');
    elements.backdrop.classList.add('show');
  }

  function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.backdrop.classList.remove('show');
  }

  function applySidebarWidth() {
    const isDesktop = window.matchMedia('(min-width: 760px)').matches;
    if (!isDesktop) {
      /* Desktop resize/collapse state must never turn the mobile navigation
         drawer into a hidden or resized sidebar. */
      elements.sidebar.classList.remove('collapsed');
      document.body.classList.remove('sidebar-collapsed');
      elements.sidebar.style.width = '';
      elements.sidebar.style.flexShrink = '';
      return;
    }
    const collapsed = localStorage.getItem('developer-notes-sidebar-collapsed') === 'true';
    const w = Number(localStorage.getItem('developer-notes-sidebar-width'));
    if (Number.isFinite(w) && w > 40) {
      elements.sidebar.style.width = w + 'px';
      elements.sidebar.style.flexShrink = '0';
    }
    if (collapsed) setSidebarCollapsed(true);
  }

  /* Collapse persists across sessions; the inline drag width must be released
     while collapsed so the stylesheet's `width: 0` can reclaim the space. */
  function setSidebarCollapsed(collapsed) {
    if (!window.matchMedia('(min-width: 760px)').matches) return;
    const sidebar = elements.sidebar;
    if (collapsed) {
      const current = sidebar.getBoundingClientRect().width;
      /* Only remember widths worth restoring; a collapse that ends a drag to
         the far edge must not overwrite the last good width with a sliver. */
      if (current >= 160) localStorage.setItem('developer-notes-sidebar-width', String(Math.round(current)));
      sidebar.style.width = '0px';
    } else {
      const saved = Number(localStorage.getItem('developer-notes-sidebar-width'));
      sidebar.style.width = Number.isFinite(saved) && saved > 40 ? saved + 'px' : '';
      sidebar.classList.remove('open');
      elements.backdrop.classList.remove('show');
    }
    sidebar.classList.toggle('collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem('developer-notes-sidebar-collapsed', collapsed ? 'true' : 'false');
    syncSidebarToggleState();
    saveNow();
  }

  /* The control is the same element in both states; only its label changes, so
     nothing moves or resizes when the sidebar is hidden or restored. */
  function syncSidebarToggleState() {
    const toggle = $('#sidebarCollapseToggle');
    if (!toggle) return;
    const collapsed = elements.sidebar.classList.contains('collapsed');
    const label = collapsed ? 'Show sidebar' : 'Hide sidebar';
    toggle.title = label;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  function setSidebarWidth(width, persist) {
    const sidebar = elements.sidebar;
    const maxW = window.innerWidth - 240;
    const next = Math.max(0, Math.min(maxW, Math.round(width)));
    sidebar.style.width = next + 'px';
    sidebar.style.flexShrink = '0';
    if (next >= 120) {
      sidebar.classList.remove('collapsed');
      document.body.classList.remove('sidebar-collapsed');
      localStorage.setItem('developer-notes-sidebar-collapsed', 'false');
      syncSidebarToggleState();
    }
    if (persist && next > 40) localStorage.setItem('developer-notes-sidebar-width', String(next));
  }

  function focusEditor() {
    if (codeMirror) codeMirror.focus();
    else if (editor) editor.focus();
  }  function handleGlobalKeys(event) {
    const key = event.key.toLowerCase();

    if (event.key === 'Escape') {
      if ($('#imageContextPanel')?.classList.contains('hidden')) {
        closeModal();
        closeSettings();
        closeRecentPanel();
        closeSearch();
        closeSidebar();
        if (document.body.classList.contains('focus-mode')) restoreFocusMode();
      } else {
        deselectImage();
      }
      return;
    }
    if (event.key === 'Enter' && elements.modal.classList.contains('show') && !elements.modalInputWrap.classList.contains('hidden')) {
      event.preventDefault();
      confirmModal();
    }
    if (event.altKey && key === 'n') {
      event.preventDefault();
      event.stopImmediatePropagation();
      openTopicModal('createTopic');
      return;
    }
    if (!(event.ctrlKey || event.metaKey)) return;
    if (key === 'n') {
      event.preventDefault();
      event.stopImmediatePropagation();
      openTopicModal('createTopic');
    } else if (key === 's') {
      event.preventDefault();
      saveNow();
    } else if (key === 'f') {
      event.preventDefault();
      openSearch(false);
    } else if (key === 'h') {
      event.preventDefault();
      openSearch(true);
    } else if (key === 'k') {
      event.preventDefault();
      openSidebar();
      elements.globalSearch.focus();
    }
  }

  function exportCurrentItem() {
    const selected = selectedItem();
    if (!selected) return;
    const language = LANGUAGE_BY_ID.get(selected.item.language) || MAIN_LANGUAGE;
    const extension = getExtension(selected.item.title) || language.extensions[0] || 'txt';
    download(notePlainText(selected.item), safeFileName(withExtension(selected.item.title, extension)), 'text/plain');
  }

  function exportAllText() {
    const data = sortedTopics(topics).map((topic) => {
      const subtopicText = sortedSubtopics(topic.subtopics).map((subtopic) => {
        const language = LANGUAGE_BY_ID.get(subtopic.language) || MAIN_LANGUAGE;
        return `\n\n## ${subtopic.title}\nLanguage: ${language.label}\n\n${notePlainText(subtopic)}`;
      }).join('');
      const language = LANGUAGE_BY_ID.get(topic.language) || MAIN_LANGUAGE;
      return `# ${topic.title}\nLanguage: ${language.label}\nLast edited: ${new Date(topic.updatedAt).toLocaleString()}\n\n${notePlainText(topic)}${subtopicText}`;
    }).join('\n\n--------------------------------------------------\n\n');
    download(data, 'developer-notes.txt', 'text/plain');
  }

  async function exportPrintableHtmlAsync(item) {
    const body = await inlineImagesIntoHtml(item);
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(safeFileName(item.title))}</title>
<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:74ch;margin:32px auto;padding:0 24px;line-height:1.6;color:#172033}h1,h2,h3{color:#24304d}code{font-family:Consolas,monospace;background:#f2f4f8;padding:1px 5px;border-radius:4px}pre code{display:block;padding:12px;overflow:auto}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #d5dbe6;padding:7px 10px;text-align:left}blockquote{border-left:3px solid #93a0c8;margin:0;padding-left:14px;color:#47536b}li{margin:3px 0}.qlx-image{max-width:100%;height:auto;margin:10px 0;display:block}.qlx-image-left{float:left;margin:6px 14px 6px 0}.qlx-image-right{float:right;margin:6px 0 6px 14px}</style>
</head><body>${body}<hr><p style="color:#8b93a5;font-size:12px">Exported from Quillix Notepad — ${new Date().toLocaleString()}</p></body></html>`;
  }

  /* Rewrite image srcs to data URLs in place so exported HTML/PDF keeps each
     image at its original position without duplicating the image list. */
  async function inlineImagesIntoHtml(item) {
    const source = item.richText ? (item.note || '') : renderMarkdownExtended(notePlainText(item));
    if (!source) return '';
    const div = document.createElement('div');
    div.innerHTML = source;
    const imgs = [...div.querySelectorAll('img')];
    for (const img of imgs) {
      const id = img.getAttribute('data-image-id');
      const blob = id ? await getImage(id).catch(() => null) : null;
      const dataUrl = blob ? await blobToBase64(blob) : null;
      if (dataUrl) {
        img.setAttribute('src', dataUrl);
        img.removeAttribute('loading');
        const cls = (img.getAttribute('class') || '').split(/\s+/).filter((c) => c && c !== 'qlx-image-broken');
        if (!cls.includes('qlx-image')) cls.push('qlx-image');
        const align = (item.imageAlignments && id && item.imageAlignments[id]) || '';
        if (align === 'left' && !cls.includes('qlx-image-left')) cls.push('qlx-image-left');
        if (align === 'right' && !cls.includes('qlx-image-right')) cls.push('qlx-image-right');
        img.setAttribute('class', cls.join(' '));
        const dims = item.imageDimensions && id && item.imageDimensions[id];
        if (dims && dims.w > 10) img.setAttribute('style', `max-width:100%;width:${Math.round(dims.w)}px;height:auto`);
      } else {
        const placeholder = div.ownerDocument.createElement('span');
        placeholder.className = 'qlx-image';
        placeholder.style.cssText = 'color:#8b93a5';
        placeholder.textContent = '[missing image]';
        img.replaceWith(placeholder);
      }
    }
    return div.innerHTML;
  }

  function richItemHtml(item) {
    if (item.richText) return item.note || '';
    const rendered = renderMarkdownExtended(notePlainText(item));
    return rendered;
  }

  function renderMarkdownExtended(markdown) {
    const html = escapeHtml(markdown)
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^---$^/gm, '<hr>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
    return html
      .split(/\n\n+/)
      .map((block) => block.trim().startsWith('<h') || block.trim().startsWith('<blockquote') || block.trim().startsWith('<hr') ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
  }

  async function exportPdf() {
    const selected = selectedItem();
    if (!selected) return;
    let html = '';
    try {
      html = await exportPrintableHtmlAsync(selected.item);
    } catch (_) {
      html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(safeFileName(selected.item.title))}</title></head><body><pre>${escapeHtml(getEditorValue())}</pre></body></html>`;
    }
    const onNative = Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    try {
      const bytes = await htmlToPdfAsync(html, selected.item);
      if (bytes) {
        download(bytes, safeFileName(withExtension(selected.item.title, 'pdf')), 'application/pdf');
        return;
      }
    } catch (error) {
      /* Android WebView has no working print() — report honestly instead of
         opening a print dialog that never appears. */
      if (onNative) {
        openNotice('PDF export failed', 'The PDF could not be generated: ' + String(error && error.message || error).slice(0, 80));
        return;
      }
    }
    printToPdfFallback(html);
  }

  function printToPdfFallback(html) {
    /* Hidden-iframe printing survives popup blockers and works on file://. */
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (_) {}
      setTimeout(() => iframe.remove(), 60000);
    }, 400);
    openNotice('Print dialog opened', 'Choose "Save as PDF" as the destination to keep a PDF copy.');
  }

  /* Load the vendored pdf-lib build lazily, only when a PDF is requested.
     The UMD build registers itself as `PDFLib` (uppercase) on window — the
     lowercase `pdfLib` check never matched, so export always fell back to the
     print dialog instead of producing real PDF bytes. */
  let pdfLibPromise = null;
  function ensurePdfLib() {
    const lib = window.PDFLib || window.pdfLib;
    if (lib) return Promise.resolve(lib);
    if (pdfLibPromise) return pdfLibPromise;
    pdfLibPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/pdf-lib.min.js';
      script.onload = () => {
        const loaded = window.PDFLib || window.pdfLib;
        loaded ? resolve(loaded) : reject(new Error('pdf-lib failed to initialize'));
      };
      script.onerror = () => { pdfLibPromise = null; reject(new Error('pdf-lib failed to load')); };
      document.head.appendChild(script);
    });
    return pdfLibPromise;
  }

  /* Render the exported HTML into a real multi-page PDF (text + images). */
  async function htmlToPdfAsync(html, item) {
    const pdfLib = await ensurePdfLib();
    const { PDFDocument, StandardFonts, rgb } = pdfLib;
    const doc = await PDFDocument.create();
    doc.setTitle(safeFileName(item.title));
    doc.setCreator('Quillix Notepad');
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontMono = await doc.embedFont(StandardFonts.Courier);

    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const pageW = 595.28; // A4
    const pageH = 841.89;
    const margin = 56;
    const contentW = pageW - margin * 2;
    const bottomLimit = 70;

    let page = doc.addPage([pageW, pageH]);
    let y = pageH - margin;

    const sanitize = (text) => {
      let out = '';
      for (const ch of String(text)) {
        const code = ch.codePointAt(0);
        out += (code >= 32 && code <= 255) || ch === '\n' || ch === '\t' ? ch : '?';
      }
      return out.replace(/\t/g, '    ');
    };
    const ensureRoom = (needed) => {
      if (y - needed < bottomLimit) { page = doc.addPage([pageW, pageH]); y = pageH - margin; }
    };

    /* Inline style state carried through the walk. */
    const walkStyle = { font, size: 11, color: rgb(0.09, 0.13, 0.2), indent: 0 };
    const styleFromNode = (node, inherited) => {
      const next = { font: inherited.font, size: inherited.size, color: inherited.color, indent: inherited.indent };
      if (node.nodeType !== Node.ELEMENT_NODE) return next;
      const tag = node.tagName.toLowerCase();
      if (tag === 'b' || tag === 'strong') next.font = fontBold;
      else if (tag === 'i' || tag === 'em') next.font = fontMono; /* no italic face embedded; mono reads as emphasis */
      else if (tag === 'code' || tag === 'kbd' || tag === 'samp') { next.font = fontMono; next.size = Math.max(9, inherited.size - 1); }
      const style = node.getAttribute && node.getAttribute('style') || '';
      const sizeMatch = style.match(/font-size:\s*([\d.]+)(px|pt)/i);
      if (sizeMatch) next.size = Math.max(7, Math.min(60, parseFloat(sizeMatch[1]) * (sizeMatch[2].toLowerCase() === 'px' ? 0.75 : 1)));
      const colorMatch = style.match(/color:\s*(#[0-9a-f]{3,8}|rgb\([^)]*\))/i);
      if (colorMatch) {
        const parsedColor = parseCssColor(colorMatch[1]);
        if (parsedColor) next.color = parsedColor;
      }
      if (/float:\s*left/i.test(style)) next.indent = inherited.indent + 14;
      if (/float:\s*right/i.test(style)) next.indent = inherited.indent + 14;
      return next;
    };

    const parseCssColor = (value) => {
      try {
        if (value[0] === '#') {
          let hex = value.slice(1);
          if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
          if (hex.length < 6) return null;
          return rgb(parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255);
        }
        const nums = value.match(/[\d.]+/g);
        if (nums && nums.length >= 3) return rgb(Number(nums[0]) / 255, Number(nums[1]) / 255, Number(nums[2]) / 255);
      } catch (_) { /* keep default color */ }
      return null;
    };

    const wrapText = (text, useFont, size, color, indent, forcedBreak) => {
      const clean = sanitize(text);
      if (!clean.trim() && !forcedBreak) return;
      const lineH = Math.round(size * 1.45 * 10) / 10;
      const maxW = contentW - indent;
      const lines = clean.split('\n');
      for (const para of lines) {
        let line = '';
        const flush = () => {
          ensureRoom(lineH);
          if (line) page.drawText(line, { x: margin + indent, y, size, font: useFont, color });
          y -= lineH;
          line = '';
        };
        for (const word of para.split(/\s+/)) {
          if (!word) continue;
          const candidate = line ? line + ' ' + word : word;
          let fits = false;
          try { fits = useFont.widthOfTextAtSize(candidate, size) <= maxW; } catch (_) { fits = candidate.length * size * 0.55 <= maxW; }
          if (fits) line = candidate;
          else {
            ensureRoom(lineH);
            if (line) page.drawText(line, { x: margin + indent, y, size, font: useFont, color });
            y -= lineH;
            line = word;
          }
        }
        ensureRoom(lineH);
        if (line) page.drawText(line, { x: margin + indent, y, size, font: useFont, color });
        y -= lineH;
      }
    };

    const drawImageNode = async (img) => {
      const src = img.getAttribute('src') || '';
      if (!src.startsWith('data:')) return;
      let embedded;
      try {
        const comma = src.indexOf(',');
        /* Test the header *before* the comma — the old /;base64,/ pattern
           required a comma that the slice had already cut off, so base64 data
           was text-encoded instead of decoded and embedPng rejected it. */
        const isBase64 = /;base64/.test(src.slice(0, comma));
        const bytes = isBase64
          ? Uint8Array.from(atob(src.slice(comma + 1)), (c) => c.charCodeAt(0))
          : new TextEncoder().encode(decodeURIComponent(src.slice(comma + 1)));
        const mime = src.slice(5, src.indexOf(';')) || src.slice(5, comma);
        if (mime === 'image/png') embedded = await doc.embedPng(bytes);
        else if (mime === 'image/jpeg' || mime === 'image/jpg') embedded = await doc.embedJpg(bytes);
        else {
          const pngBytes = await rasterizeImageToPng(src);
          if (pngBytes) embedded = await doc.embedPng(pngBytes);
        }
      } catch (_) { embedded = null; }
      if (!embedded) return;
      const cssW = parseFloat(img.style?.width) || Number(img.dataset?.width) || embedded.width;
      const scale = Math.min(1, contentW / cssW, 420 / embedded.height);
      const drawW = embedded.width * scale;
      const drawH = embedded.height * scale;
      ensureRoom(drawH + 10);
      const floatStyle = String(img.style?.float || '').toLowerCase();
      const x = floatStyle === 'left' ? margin
        : floatStyle === 'right' ? pageW - margin - drawW
        : margin + (contentW - drawW) / 2;
      page.drawImage(embedded, { x, y: y - drawH, width: drawW, height: drawH });
      y -= drawH + 10;
    };

    const isBlockTag = (tag) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'li', 'ul', 'ol', 'pre', 'blockquote', 'table', 'tr', 'section', 'article'].includes(tag);

    const walk = async (node, inherited) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue || '';
        if (text) {
          const style = inherited;
          wrapText(text, style.font, style.size, style.color, style.indent, false);
        }
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (tag === 'img') {
        if (y < pageH - margin - 1) y -= 6;
        await drawImageNode(node);
        return;
      }
      if (tag === 'br') { ensureRoom(14); y -= Math.round(walkStyle.size * 1.45 * 10) / 10; return; }
      if (tag === 'hr') {
        ensureRoom(16);
        page.drawLine({ start: { x: margin, y }, end: { x: pageW - margin, y }, thickness: 0.8, color: rgb(0.6, 0.65, 0.75) });
        y -= 14;
        return;
      }
      if (tag === 'script' || tag === 'style') return;

      const style = styleFromNode(node, inherited);
      const isHeading = /^h[1-6]$/.test(tag);
      const isBlock = isBlockTag(tag);
      const headingSizes = { h1: 20, h2: 16, h3: 13.5, h4: 12, h5: 11, h6: 10.5 };
      if (isHeading) {
        style.size = headingSizes[tag];
        style.font = fontBold;
        style.color = rgb(0.14, 0.19, 0.3);
        y -= style.size * 0.45;
      } else if (tag === 'pre') {
        style.font = fontMono;
        style.size = 9;
        y -= 6;
      } else if (tag === 'li') {
        style.indent = inherited.indent + 14;
        y -= 4;
        wrapText('\u2022 ', style.font, style.size, style.color, inherited.indent, false);
        y += Math.round(style.size * 1.45 * 10) / 10; /* bullet shares the first text line */
      } else if (tag === 'blockquote') {
        style.indent = inherited.indent + 16;
        y -= 6;
      } else if (isBlock && tag !== 'div') {
        y -= 6;
      }

      let hasBlockChild = false;
      for (const child of node.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE && isBlockTag(child.tagName.toLowerCase())) { hasBlockChild = true; break; }
      }
      if (isBlock && hasBlockChild) {
        /* Block containers flush their raw inline text first to keep order. */
        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
            wrapText(child.nodeValue, style.font, style.size, style.color, style.indent, false);
          } else {
            await walk(child, style);
          }
        }
      } else {
        for (const child of node.childNodes) await walk(child, style);
      }
      if (isBlock) y -= isHeading ? style.size * 0.3 : 4;
    };

    for (const child of parsed.body.childNodes) await walk(child, walkStyle);

    return await doc.save();
  }

  /* Convert GIF/WebP/SVG/BMP data URLs to PNG bytes pdf-lib can embed. */
  async function rasterizeImageToPng(dataUrl) {
    try {
      const img = await loadImageElement(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return null;
      const buffer = await blob.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (_) {
      return null;
    }
  }

  async function exportHtml() {
    const selected = selectedItem();
    if (!selected) return;
    const html = await exportPrintableHtmlAsync(selected.item);
    download(html, safeFileName(withExtension(selected.item.title, 'html')), 'text/html');
  }

  async function exportBackup() {
    const imageMap = {};
    const ids = new Set();
    topics.forEach((topic) => collectImageIds(topic, ids));
    for (const id of ids) {
      const blob = await getImage(id).catch(() => null);
      if (blob) imageMap[id] = await blobToBase64(blob).catch(() => null);
    }
    const text = JSON.stringify({ app: 'Quillix Notepad', version: 5, exportedAt: new Date().toISOString(), topics, selectedRef, settings, recents, expanded, images: imageMap }, null, 2);
    /* Desktop: write through a native main-process save dialog — the blob
       download path needs a user gesture the menu click cannot supply. */
    if (window.quillixDesktop?.isDesktop && typeof window.quillixDesktop.saveBackup === 'function') {
      const savedPath = await window.quillixDesktop.saveBackup(text).catch(() => null);
      if (savedPath) { openNotice('Backup saved', 'Notes backed up to: ' + savedPath); return; }
      if (savedPath === null) { /* dialog canceled */ return; }
    }
    download(text, 'quillix-notepad-backup.json', 'application/json');
  }
  /* Shared core for every import entry point: browser picker, drag & drop,
     and the desktop menu (which delivers pre-read file contents). Backup JSON
     files also restore their embedded images into the IndexedDB store. */
  async function applyImportedItems(items, onDone) {
    if (!Array.isArray(items) || !items.length) { if (onDone) onDone(); return; }
    try {
      for (const item of items) {
        if (!item || !item.name || typeof item.text !== 'string' || !item.name.endsWith('.json')) continue;
        const parsed = parseBackup(item.text);
        if (parsed && parsed.images && typeof parsed.images === 'object') {
          for (const [id, dataUrl] of Object.entries(parsed.images)) {
            if (dataUrl && dataUrl.startsWith('data:')) {
              try {
                const blob = await (await fetch(dataUrl)).blob();
                await putImage(id, blob);
              } catch (_) {}
            }
          }
        }
      }
    } catch (_) {}
    try {
      for (const item of items) {
        if (!item || typeof item.text !== 'string') continue;
        const parsed = parseBackup(item.text);
        if (parsed) {
          mergeTopics(parsed.topics);
          if (parsed.settings) settings = { ...DEFAULT_SETTINGS, ...settings, ...parsed.settings };
          if (parsed.expanded) expanded = unique([...expanded, ...parsed.expanded]);
        } else if (item.name) {
          createTopicFromImport(item.name, item.text);
        }
      }
      applySettingsToControls();
      applyEditorSettings();
      render();
    } catch (_) {
      openNotice('Import failed', 'Choose a readable text, code, or Quillix Notepad JSON backup.');
    }
    if (onDone) onDone();
  }
  async function importFiles(event) {
    const files = [...event.target.files];
    if (!files.length) return;
    event.target.value = '';
    if (files.length > 50) { openNotice('Too many files', 'Import up to 50 files at a time.'); return; }
    if (files.some((file) => file.size > 25 * 1024 * 1024)) { openNotice('File too large', 'Files must be 25 MB or smaller.'); return; }
    const fileItems = await Promise.all(files.map(readFile));
    applyImportedItems(fileItems);
  }
  async function importFilesOnlyText(event) {
    const files = [...event.target.files];
    if (!files.length) return;
    event.target.value = '';
    if (files.length > 50) { openNotice('Too many files', 'Import up to 50 files at a time.'); return; }
    if (files.some((file) => file.size > 25 * 1024 * 1024)) { openNotice('File too large', 'Files must be 25 MB or smaller.'); return; }
    const fileItems = await Promise.all(files.map(readFile));
    applyImportedItems(fileItems);
  }
  function collectImageIds(item, set) {
    if (!item) return;
    const ids = new Set();
    const scan = (html) => { const m = html.match(/data-image-id="([^"]+)"/g); if (m) m.forEach((s) => ids.add(s.slice(15, -1))); };
    scan(item.note);
    ids.forEach((id) => set.add(id));
    (item.subtopics || []).forEach((sub) => collectImageIds(sub, set));
  }

  /* ---- Word (.docx) import — mammoth loads lazily, only when needed ---- */
  let mammothPromise = null;
  function ensureMammoth() {
    if (window.mammoth) return Promise.resolve(window.mammoth);
    if (mammothPromise) return mammothPromise;
    mammothPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/mammoth.browser.min.js';
      script.onload = () => {
        const lib = window.mammoth;
        lib && lib.convertToHtml ? resolve(lib) : reject(new Error('mammoth failed to initialize'));
      };
      script.onerror = () => { mammothPromise = null; reject(new Error('mammoth failed to load')); };
      document.head.appendChild(script);
    });
    return mammothPromise;
  }

  function importWordFromFiles(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    file.arrayBuffer()
      .then((buffer) => importWordFromBytes(file.name, buffer))
      .catch(() => openNotice('Could not read file', 'The selected file could not be read.'));
  }

  async function importWordFromBytes(name, data) {
    const ext = (String(name).split('.').pop() || '').toLowerCase();
    if (ext === 'doc') {
      openNotice('Legacy .doc not supported', 'Word 97–2003 (.doc) files cannot be converted in-app. Open the file in Word or Google Docs and save it as .docx, then import it again.');
      return;
    }
    if (ext !== 'docx') {
      openNotice('Not a Word document', 'Choose a .docx file saved from Word, Google Docs, or LibreOffice.');
      return;
    }
    let mammoth;
    try {
      mammoth = await ensureMammoth();
    } catch (_) {
      openNotice('Word support unavailable', 'The Word converter could not be loaded. Check your connection and try again.');
      return;
    }
    try {
      const buffer = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
      let html = String(result.value || '');
      if (!html.trim()) {
        openNotice('Document is empty', 'This Word document contains no readable content.');
        return;
      }
      /* Move embedded images (mammoth yields data: URLs) into the IndexedDB
         image store so they hydrate, export, and survive reload like every
         other image in the app. */
      const div = document.createElement('div');
      div.innerHTML = html;
      const imgs = [...div.querySelectorAll('img')];
      for (const img of imgs) {
        try {
          const src = img.getAttribute('src') || '';
          if (!src.startsWith('data:')) continue;
          const blob = await (await fetch(src)).blob();
          if (!blob || !blob.size) continue;
          const id = imageId();
          await putImage(id, blob);
          img.setAttribute('src', URL.createObjectURL(blob));
          img.setAttribute('data-image-id', id);
          img.setAttribute('class', 'qlx-image');
          img.setAttribute('draggable', 'true');
          img.setAttribute('contenteditable', 'false');
          img.style.maxWidth = '100%';
        } catch (_) { /* keep the data: URL if the store rejects it */ }
      }
      html = div.innerHTML;
      const base = cleanTitle(String(name).replace(/\.docx$/i, '')) || 'Word document';
      if (hasDuplicateTopic(base)) {
        modalAction = { action: 'confirmImportWord', title: base, html };
        openModal({
          title: 'Note already exists',
          description: `A note named “${base}” already exists. Import this Word document as a copy? Your existing note will not be changed.`,
          icon: '<i class="fa-solid fa-file-word"></i>',
          confirm: 'Import as copy',
          noInput: true
        });
        return;
      }
      finishWordImport(base, html);
    } catch (error) {
      const detail = String(error && error.message || error).slice(0, 90);
      openNotice('Could not open document', `The file may be corrupted or not a valid .docx file. (${detail})`);
    }
  }

  function finishWordImport(baseTitle, html) {
    let title = baseTitle;
    let number = 2;
    while (hasDuplicateTopic(title)) title = `${baseTitle} copy ${number++}`;
    const now = new Date().toISOString();
    const topic = { id: uid(), title, note: html, language: 'text', richText: true, createdAt: now, updatedAt: now, favorite: false, pinned: false, subtopics: [] };
    topics.push(topic);
    selectedRef = { type: 'topic', topicId: topic.id };
    expanded = unique([...expanded, topic.id]);
    touchRecent(refToString(selectedRef));
    closeModal();
    render();
  }
  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  }


  async function importFileList(files) {
    elements.fileInput.files = files;
    elements.fileInput.dispatchEvent(new Event('change'));
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, text: String(reader.result || '') });
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function parseBackup(text) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) return { topics: dedupeTopicIds(data.filter(validTopic).map(normalizeTopic)) };
      if (data && Array.isArray(data.topics)) return { topics: dedupeTopicIds(data.topics.filter(validTopic).map(normalizeTopic)), settings: data.settings, expanded: data.expanded };
    } catch {
      return null;
    }
    return null;
  }

  function dedupeTopicIds(items) {
    const seen = new Set();
    items.forEach((topic) => {
      if (seen.has(topic.id)) topic.id = uid();
      seen.add(topic.id);
    });
    return items;
  }

  function mergeTopics(incoming) {
    const byId = new Map(topics.map((topic) => [topic.id, topic]));
    incoming.forEach((topic) => byId.set(topic.id, byId.has(topic.id) ? { ...byId.get(topic.id), ...topic, subtopics: topic.subtopics || [] } : topic));
    topics = [...byId.values()];
    selectedRef = selectedItem() ? selectedRef : topics.length ? { type: 'topic', topicId: topics[0].id } : { type: 'topic', topicId: '' };
  }

  function createTopicFromImport(name, note) {
    let title = cleanTitle(name) || 'Imported note';
    let number = 2;
    while (hasDuplicateTopic(title)) title = `${cleanTitle(name)} ${number++}`;
    createTopic(title, note);
  }

  function openNotice(title, description) {
    modalAction = null;
    openModal({ title, description, icon: '<i class="fa-solid fa-circle-info"></i>', confirm: 'Close', noInput: true });
  }

  function readTopics() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.topics) || '[]');
      return Array.isArray(data) ? data.filter(validTopic).map(normalizeTopic) : [];
    } catch {
      return [];
    }
  }

  function readSelectedRef() {
    const raw = localStorage.getItem(KEYS.selected) || '';
    if (raw.startsWith('topic:') || raw.startsWith('subtopic:')) return parseRef(raw);
    return { type: 'topic', topicId: raw };
  }

  function readOpenTabs() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.tabs) || '[]');
      return Array.isArray(data) ? unique(data.filter((ref) => typeof ref === 'string')).slice(0, 24) : [];
    } catch {
      return [];
    }
  }

  function readSettings() {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEYS.settings) || '{}') };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function readRecents() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.recents) || '[]');
      return Array.isArray(data) ? data.filter((ref) => typeof ref === 'string').slice(0, 8) : [];
    } catch {
      return [];
    }
  }

  function readExpanded() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.expanded) || '[]');
      return Array.isArray(data) ? data.filter((id) => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  function readTrash() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.trash) || '[]');
      return Array.isArray(data) ? data.filter(validTopic).map(normalizeTopic).map((topic) => ({ ...topic, deletedAt: validDate(topic.deletedAt) ? topic.deletedAt : new Date().toISOString() })) : [];
    } catch {
      return [];
    }
  }

  function readArchive() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.archive) || '[]');
      return Array.isArray(data) ? data.filter(validTopic).map(normalizeTopic) : [];
    } catch {
      return [];
    }
  }

  function readTags() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.tags) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch {
      return {};
    }
  }

  function readHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.history) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch {
      return {};
    }
  }

  function readDrafts() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.drafts) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch {
      return {};
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 350);
  }

  function scheduleSaveRetry() {
    clearTimeout(saveRetryTimer);
    saveRetryTimer = setTimeout(() => {
      if (saveHadError) { saveHadError = false; saveNow(); }
    }, 5000);
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      try {
        // Quota exceeded: free space by trimming low-value stores first, then retry once.
        localStorage.removeItem(KEYS.drafts);
        pruneHistory();
        localStorage.setItem(key, value);
        return true;
      } catch (_) {
        saveHadError = true;
        scheduleSaveRetry();
        const label = (error && /quota/i.test(String(error))) ? 'Storage full.' : 'Could not save to this browser.';
        showSaveError(`${label} Export a backup now, then delete old notes to free space.`);
        return false;
      }
    }
  }

  function showSaveError(message) {
    if (elements.status) {
      elements.status.classList.add('save-error');
      elements.status.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(message)}`;
    }
  }

  function pruneHistory() {
    for (const key in history) {
      let entries = history[key] || [];
      while ((entries.length > 3 || historyBytes() > 1_500_000) && entries.length) {
        entries = entries.slice(0, -1);
        safeSetRaw(KEYS.history, JSON.stringify(history));
      }
    }
  }

  function historyBytes() {
    return (localStorage.getItem(KEYS.history) || '').length;
  }

  function safeSetRaw(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* trimming failed; retried on next save */ }
  }

  function saveNow() {
    clearTimeout(saveTimer);
    if (saveHadError) return;
    const ok = safeSet(KEYS.topics, JSON.stringify(topics))
      && safeSet(KEYS.selected, refToString(selectedRef))
      && safeSet(KEYS.settings, JSON.stringify(settings))
      && safeSet(KEYS.recents, JSON.stringify(recents))
      && safeSet(KEYS.expanded, JSON.stringify(expanded))
      && safeSet(KEYS.tabs, JSON.stringify(openTabs))
      && safeSet(KEYS.trash, JSON.stringify(trash))
      && safeSet(KEYS.archive, JSON.stringify(archived))
      && safeSet(KEYS.tags, JSON.stringify(noteTags));
    if (ok && elements.status) {
      elements.status.classList.remove('save-error');
      elements.status.innerHTML = '<i class="fa-solid fa-cloud-check"></i> Saved';
    }
  }
  function markSaving() {
    elements.status.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Saving';
  }

  function selectedItem() {
    const topic = topics.find((item) => item.id === selectedRef.topicId);
    if (!topic) return null;
    if (selectedRef.type === 'subtopic') {
      const subtopic = topic.subtopics.find((item) => item.id === selectedRef.subtopicId);
      if (subtopic) return { type: 'subtopic', topic, item: subtopic };
    }
    return { type: 'topic', topic, item: topic };
  }

  function resolveRef(ref) {
    const parsed = parseRef(ref);
    const topic = topics.find((item) => item.id === parsed.topicId);
    if (!topic) return null;
    if (parsed.type === 'subtopic') {
      const subtopic = topic.subtopics.find((item) => item.id === parsed.subtopicId);
      return subtopic ? { type: 'subtopic', topic, item: subtopic } : null;
    }
    return { type: 'topic', topic, item: topic };
  }

  function refToString(ref) {
    if (!ref) return '';
    return ref.type === 'subtopic' ? `subtopic:${ref.topicId}:${ref.subtopicId}` : `topic:${ref.topicId}`;
  }

  function parseRef(ref) {
    const parts = String(ref || '').split(':');
    if (parts[0] === 'subtopic') return { type: 'subtopic', topicId: parts[1] || '', subtopicId: parts[2] || '' };
    if (parts[0] === 'topic') return { type: 'topic', topicId: parts[1] || '' };
    return { type: 'topic', topicId: String(ref || '') };
  }

  function sortedTopics(items) {
    return [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.favorite) - Number(a.favorite) || new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  function sortedSubtopics(items) {
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt) - new Date(b.createdAt));
  }

  function sanitizeId(value) {
    return String(value || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  }

  function normalizeTopic(topic) {
    const now = new Date().toISOString();
    const title = cleanTitle(topic.title) || 'Untitled';
    return {
      id: sanitizeId(topic.id) || uid(),
      title,
      note: typeof topic.note === 'string' ? topic.note : '',
      language: validSubtopicLanguage(topic.language || 'text'),
      createdAt: validDate(topic.createdAt) ? topic.createdAt : now,
      updatedAt: validDate(topic.updatedAt) ? topic.updatedAt : now,
      favorite: Boolean(topic.favorite),
      pinned: Boolean(topic.pinned),
      editorTheme: validEditorTheme(topic.editorTheme),
      /* Per-note appearance: kept across reloads so each panel reopens exactly
         the way it was left. Unset means "follow the app defaults". */
      editorFontSize: validFontSize(topic.editorFontSize),
      wordWrap: typeof topic.wordWrap === 'boolean' ? topic.wordWrap : undefined,
      richText: Boolean(topic.richText),
      locked: Boolean(topic.locked && topic.vault),
      vault: topic.vault && typeof topic.vault === 'object' ? topic.vault : null,
      textColors: Array.isArray(topic.textColors) ? topic.textColors : [],
      imageDimensions: validIdMap(topic.imageDimensions),
      imageAlignments: validIdMap(topic.imageAlignments),
      subtopics: Array.isArray(topic.subtopics) ? topic.subtopics.filter(validTopic).map((subtopic, index) => normalizeSubtopic(subtopic, index)) : []
    };
  }

  function validIdMap(map) {
    if (!map || typeof map !== 'object' || Array.isArray(map)) return {};
    const out = {};
    for (const [key, value] of Object.entries(map)) {
      if (typeof key !== 'string') continue;
      if (value && typeof value === 'object') {
        const w = Number(value.w);
        const h = Number(value.h);
        out[key] = { w: Number.isFinite(w) ? w : 0, h: Number.isFinite(h) ? h : 0 };
      } else if (typeof value === 'string') {
        out[key] = value;
      }
    }
    return out;
  }

  function normalizeSubtopic(subtopic, index) {
    const now = new Date().toISOString();
    const title = cleanTitle(subtopic.title) || 'Untitled subtopic';
    return {
      id: sanitizeId(subtopic.id) || uid(),
      title,
      note: typeof subtopic.note === 'string' ? subtopic.note : '',
      language: validSubtopicLanguage(subtopic.language || detectLanguage(title)),
      editorTheme: validEditorTheme(subtopic.editorTheme),
      editorFontSize: validFontSize(subtopic.editorFontSize),
      wordWrap: typeof subtopic.wordWrap === 'boolean' ? subtopic.wordWrap : undefined,
      richText: Boolean(subtopic.richText),
      locked: Boolean(subtopic.locked && subtopic.vault),
      vault: subtopic.vault && typeof subtopic.vault === 'object' ? subtopic.vault : null,
      textColors: Array.isArray(subtopic.textColors) ? subtopic.textColors : [],
      imageDimensions: validIdMap(subtopic.imageDimensions),
      imageAlignments: validIdMap(subtopic.imageAlignments),
      createdAt: validDate(subtopic.createdAt) ? subtopic.createdAt : now,
      updatedAt: validDate(subtopic.updatedAt) ? subtopic.updatedAt : now,
      order: Number.isFinite(subtopic.order) ? subtopic.order : index
    };
  }

  function validTopic(topic) {
    return topic && typeof topic.title === 'string';
  }

  function validSubtopicLanguage(language) {
    return LANGUAGE_BY_ID.has(language) ? language : 'text';
  }

  function validEditorTheme(theme) {
    return Object.prototype.hasOwnProperty.call(CODE_MIRROR_THEMES, theme) ? theme : '';
  }

  /* Editor font size is per note and optional; anything outside the usable range
     (or not a number) simply falls back to the global setting. */
  function validFontSize(size) {
    const value = Number(size);
    return Number.isFinite(value) && value >= 12 && value <= 28 ? value : undefined;
  }

  function matchesTree(topic, query) {
    return !query || topic.title.toLowerCase().includes(query) || topic.note.toLowerCase().includes(query) || topic.subtopics.some((subtopic) => matchesSubtopic(subtopic, query));
  }

  function matchesSubtopic(subtopic, query) {
    return subtopic.title.toLowerCase().includes(query) || subtopic.note.toLowerCase().includes(query) || subtopic.language.toLowerCase().includes(query);
  }

  function hasDuplicateTopic(title, exceptId = '') {
    const key = cleanTitle(title).toLowerCase();
    return topics.some((topic) => topic.id !== exceptId && topic.title.toLowerCase() === key);
  }

  function hasDuplicateSubtopic(topic, title, exceptId = '') {
    const key = cleanTitle(title).toLowerCase();
    return topic.subtopics.some((subtopic) => subtopic.id !== exceptId && subtopic.title.toLowerCase() === key);
  }

  function cleanTitle(title) {
    return String(title || '').trim().replace(/\s+/g, ' ');
  }

  function detectLanguage(title) {
    const extension = cleanTitle(title).split('.').pop()?.toLowerCase();
    return SUBTOPIC_LANGUAGES.find((language) => language.extensions.includes(extension))?.id || 'text';
  }

  function touchRecent(ref) {
    recents = [ref, ...recents.filter((item) => item !== ref)].slice(0, 8);
  }

  function showError(message) {
    elements.formError.textContent = message;
    elements.modalInput.focus();
  }

  function uid() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function unique(items) {
    return [...new Set(items)];
  }

  function validDate(value) {
    return !Number.isNaN(new Date(value).getTime());
  }

  function dateLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'recently';
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
    if (diff < 86400000) return `${Math.max(1, Math.floor(diff / 3600000))}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function getExtension(title) {
    const parts = cleanTitle(title).split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  /* ---- Image selection + resize + alignment ---- */
  /* Declared as var: initImageInteraction runs during page init (before this
     line executes) and calls positionImageContextPanel(), which reads
     selectedImage. var hoists the binding as undefined so that read returns
     falsy instead of throwing a temporal-dead-zone ReferenceError that would
     abort note loading. */
  var selectedImage = null;
  var resizeState = null;
  var imageContextWasOpen = false;

  function selectImage(img) {
    if (!img || !editor?.contains(img)) return;
    if (selectedImage && selectedImage !== img) selectedImage.classList.remove('qlx-image-selected');
    selectedImage = img;
    img.classList.add('qlx-image-selected');
    updateImageContextPanel();
    openImageContextPanel();
    showResizeHandles();
  }
  function deselectImage() {
    if (selectedImage) {
      selectedImage.classList.remove('qlx-image-selected');
      selectedImage = null;
    }
    hideResizeHandles();
    closeImageContextPanel();
  }
  function updateImageContextPanel() {
    if (!selectedImage || !editor?.contains(selectedImage)) { deselectImage(); return; }
    const id = selectedImage.dataset.imageId;
    const panel = $('#imageContextPanel');
    if (!panel) return;
    panel.dataset.imageId = id || '';
    const hasId = Boolean(id);
    panel.querySelector('#imageReplaceButton').disabled = !hasId;
    panel.querySelector('#imageDeleteButton').disabled = !hasId;
    panel.querySelector('#imageRestoreButton').disabled = !hasId;
    const align = selectedImage.style.float === 'left' ? 'left' : selectedImage.style.float === 'right' ? 'right' : 'center';
    panel.querySelectorAll('[data-align]').forEach((btn) => btn.classList.toggle('active', btn.dataset.align === align));
    panel.querySelectorAll('[data-preset]').forEach((btn) => btn.classList.remove('active'));
    const w = parseInt(selectedImage.style.width, 10) || 0;
    if (w) {
      const presetWidth = w <= 190 ? 180 : w <= 370 ? 360 : w <= 630 ? 620 : 0;
      panel.querySelectorAll('[data-preset]').forEach((btn) => {
        const map = { small: 180, medium: 360, large: 620 };
        btn.classList.toggle('active', Boolean(map[btn.dataset.preset]) && map[btn.dataset.preset] === presetWidth);
      });
    }
  }
  function openImageContextPanel() {
    const panel = $('#imageContextPanel');
    if (!panel) return;
    imageContextWasOpen = !panel.classList.contains('hidden');
    panel.classList.remove('hidden');
    positionImageContextPanel();
  }
  function closeImageContextPanel() {
    const panel = $('#imageContextPanel');
    if (!panel) return;
    panel.classList.add('hidden');
  }

  /* Four fixed-position corner handles overlaid on the selected image. */
  function showResizeHandles() {
    const box = elements.imageResizeHandles;
    if (!box || !selectedImage) return;
    box.classList.remove('hidden');
    positionResizeHandles();
  }
  function hideResizeHandles() {
    elements.imageResizeHandles?.classList.add('hidden');
  }
  function positionResizeHandles() {
    const box = elements.imageResizeHandles;
    if (!box || box.classList.contains('hidden') || !selectedImage || !editor?.contains(selectedImage)) return;
    const rect = selectedImage.getBoundingClientRect();
    box.style.left = rect.left + 'px';
    box.style.top = rect.top + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
  }
  function positionImageContextPanel() {
    const panel = $('#imageContextPanel');
    if (!panel || !selectedImage) return;
    const editorHost = elements.editorHost.getBoundingClientRect();
    const imgRect = selectedImage.getBoundingClientRect();
    const panelW = panel.offsetWidth;
    const spaceBelow = editorHost.bottom - imgRect.bottom;
    let top = imgRect.bottom + 6;
    if (top + 220 > editorHost.bottom) top = imgRect.top - 220 - 6;
    if (top < editorHost.top + 4) top = editorHost.top + 4;
    let left = imgRect.left + imgRect.width / 2 - panelW / 2;
    const minLeft = editorHost.left + 4;
    const maxLeft = editorHost.right - panelW - 4;
    left = Math.max(minLeft, Math.min(left, maxLeft));
    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
  }
  function applyImagePreset(preset) {
    if (!selectedImage || !editor?.contains(selectedImage)) return;
    const id = selectedImage.dataset.imageId;
    if (!id) return;
    getImage(id).then((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (!editor?.contains(selectedImage)) return;
        const natW = img.naturalWidth || Number(selectedImage.dataset.naturalWidth) || 0;
        const natH = img.naturalHeight || Number(selectedImage.dataset.naturalHeight) || 0;
        if (!natW || !natH) return;
        let targetW;
        if (preset === 'original') targetW = natW;
        else if (preset === 'small') targetW = Math.min(180, natW);
        else if (preset === 'medium') targetW = Math.min(360, natW);
        else if (preset === 'large') targetW = Math.min(620, natW);
        else targetW = natW;
        setImageWidth(selectedImage, targetW, natW, natH);
        commitEditorValue(editor.innerHTML);
      };
      img.onerror = () => { if (editor?.contains(selectedImage)) setImageWidth(selectedImage, 280, 280, 280); };
      img.src = url;
    });
  }
  function setImageWidth(img, targetW, natW, natH) {
    if (!editor?.contains(img)) return;
    targetW = Math.max(40, Math.min(targetW, editor.clientWidth - 4));
    if (natW && natH) {
      const ratio = natH / natW;
      img.style.width = targetW + 'px';
      img.style.height = Math.round(targetW * ratio) + 'px';
    } else {
      img.style.width = targetW + 'px';
      img.style.height = 'auto';
    }
    img.style.maxWidth = '100%';
    saveImageDimensions(img);
  }
  function setImageAlignment(img, alignment) {
    if (!editor?.contains(img)) return;
    img.style.clear = 'both';
    if (alignment === 'left') { img.style.float = 'left'; img.style.margin = '6px 14px 6px 0'; }
    else if (alignment === 'right') { img.style.float = 'right'; img.style.margin = '6px 0 6px 14px'; }
    else { img.style.float = 'none'; img.style.margin = '10px auto'; img.style.display = 'block'; }
    saveImageAlignment(img);
  }
  function saveImageAlignment(img) {
    const id = img.dataset.imageId;
    if (!id) return;
    const selected = selectedItem();
    if (!selected) return;
    const imgs = editor.querySelectorAll('img.qlx-image');
    const alignments = new Map();
    imgs.forEach((i) => { if (i.dataset.imageId) alignments.set(i.dataset.imageId, i.style.float || 'none'); });
    selected.item.imageAlignments = Object.fromEntries(alignments);
    commitEditorValue(editor.innerHTML);
  }
  function saveImageDimensions(img) {
    const id = img.dataset.imageId;
    if (!id) return;
    const selected = selectedItem();
    if (!selected) return;
    const imgs = editor.querySelectorAll('img.qlx-image');
    const dims = new Map();
    imgs.forEach((i) => { if (i.dataset.imageId) dims.set(i.dataset.imageId, { w: i.offsetWidth || i.style.width ? parseInt(i.style.width, 10) || i.offsetWidth : 0, h: i.offsetHeight || i.style.height ? parseInt(i.style.height, 10) || i.offsetHeight : 0 }); });
    selected.item.imageDimensions = Object.fromEntries([...dims].map(([k, v]) => [k, v]));
    commitEditorValue(editor.innerHTML);
  }
  function restoreOriginalSize() {
    if (!selectedImage || !editor?.contains(selectedImage)) return;
    const id = selectedImage.dataset.imageId;
    if (!id) return;
    getImage(id).then((blob) => {
      if (!blob || !editor?.contains(selectedImage)) return;
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (!editor?.contains(selectedImage)) return;
        setImageWidth(selectedImage, img.naturalWidth || Number(selectedImage.dataset.naturalWidth) || 280, img.naturalWidth || Number(selectedImage.dataset.naturalWidth) || 280, img.naturalHeight || Number(selectedImage.dataset.naturalHeight) || 280);
        commitEditorValue(editor.innerHTML);
      };
      img.onerror = () => { if (editor?.contains(selectedImage)) setImageWidth(selectedImage, 280, 280, 280); };
      img.src = url;
    });
  }
  function deleteSelectedImage() {
    if (!selectedImage || !editor?.contains(selectedImage)) return;
    const id = selectedImage.dataset.imageId;
    const item = selectedItem()?.item || null;
    const sel = window.getSelection();
    const range = sel.rangeCount ? sel.getRangeAt(0) : null;
    const removeNode = () => {
      selectedImage.remove();
      /* Only drop the stored blob when no other note still references it. */
      if (id && item && !imageIdInUse(id, item)) deleteImage(id).catch(() => {});
      if (id && item?.imageDimensions) delete item.imageDimensions[id];
      if (id && item?.imageAlignments) delete item.imageAlignments[id];
      editor.focus();
      deselectImage();
      commitEditorValue(editor.innerHTML);
      updateEditorStats();
    };
    try {
      if (range && editor.contains(range.commonAncestorContainer)) {
        const before = range.startContainer === selectedImage || range.startContainer.parentElement === selectedImage ? range : null;
        if (before) range.setStartAfter(selectedImage);
      }
      removeNode();
    } catch (_) {
      removeNode();
    }
  }
  function replaceSelectedImage() {
    if (!selectedImage || !editor?.contains(selectedImage)) return;
    elements.imageReplaceInput.value = '';
    elements.imageReplaceInput.click();
  }
  elements.imageReplaceInput.addEventListener('change', async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    event.target.value = '';
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      openNotice('Not an image', 'Please choose a PNG, JPG, WebP, or GIF image.');
      return;
    }
    if (!selectedImage || !editor?.contains(selectedImage)) return;
    const oldId = selectedImage.dataset.imageId;
    const item = selectedItem()?.item || null;
    try {
      const imageData = await loadImageFile(file);
      /* Fresh id so notes that share the old id keep their own image. */
      const id = imageId();
      await putImage(id, imageData.blob);
      if (oldId && item && !imageIdInUse(oldId, item)) deleteImage(oldId).catch(() => {});
      selectedImage.dataset.imageId = id;
      const natW = imageData.naturalWidth || imageData.width;
      const natH = imageData.naturalHeight || imageData.height;
      selectedImage.src = URL.createObjectURL(imageData.blob);
      setTimeout(() => {
        if (!editor?.contains(selectedImage)) return;
        selectedImage.dataset.naturalWidth = String(natW);
        selectedImage.dataset.naturalHeight = String(natH);
        selectedImage.dataset.width = String(imageData.width);
        selectedImage.dataset.height = String(imageData.height);
        setImageWidth(selectedImage, imageData.width, natW, natH);
        commitEditorValue(editor.innerHTML);
        positionResizeHandles();
      }, 0);
    } catch (error) {
      if (/abort/i.test(String(error))) return;
      openNotice('Could not replace image', 'The new image could not be read.');
    }
  });
  /* ---- Durable image storage (IndexedDB) ---- */

  function openImageDb() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB unavailable'));
    if (imageDbPromise) return imageDbPromise;
    imageDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(IMAGE_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IMAGE_STORE)) db.createObjectStore(IMAGE_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open image store'));
      request.onblocked = () => reject(new Error('Image store is blocked'));
    }).catch((error) => { imageDbPromise = null; throw error; });
    return imageDbPromise;
  }

  async function imageStoreTransaction(mode, run) {
    const db = await openImageDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE, mode);
      const store = tx.objectStore(IMAGE_STORE);
      let result;
      try { result = run(store); } catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(result && 'result' in result ? result.result : result);
      tx.onerror = () => reject(tx.error || new Error('Image store transaction failed'));
      tx.onabort = () => reject(tx.error || new Error('Image store transaction aborted'));
    });
  }

  function putImage(id, blob) {
    if (!id || !blob) return Promise.reject(new Error('Missing image data'));
    return imageStoreTransaction('readwrite', (store) => store.put(blob, id));
  }

  function getImage(id) {
    if (!id) return Promise.resolve(null);
    return imageStoreTransaction('readonly', (store) => store.get(id));
  }

  function deleteImage(id) {
    if (!id) return Promise.resolve();
    return imageStoreTransaction('readwrite', (store) => store.delete(id));
  }

  function imageId() {
    return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  /* True while any note still references an image id — used so deleting an
     image in one note never removes a copy another note depends on. */
  function imageIdInUse(id, exceptItem) {
    const scan = (item) => {
      if (!item || item === exceptItem) return false;
      if (typeof item.note === 'string' && item.note.includes(`data-image-id="${id}"`)) return true;
      return (item.subtopics || []).some(scan);
    };
    return topics.some(scan) || archived.some(scan) || trash.some(scan);
  }

  /* ---- Image file loading (validate + downscale big images) ---- */
  const IMAGE_MIME_BY_EXT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml' };
  const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
  const MAX_IMAGE_DIMENSION = 4096;

  async function loadImageFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const mime = file.type || IMAGE_MIME_BY_EXT[ext] || '';
    if (!mime.startsWith('image/')) throw new Error('Unsupported file type');
    if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'].indexOf(mime) === -1) throw new Error('Unsupported image format');
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Image too large');

    const objectUrl = URL.createObjectURL(file);
    try {
      const dims = await new Promise((resolve, reject) => {
        const probe = new Image();
        probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight });
        probe.onerror = () => reject(new Error('Could not decode image'));
        probe.src = objectUrl;
      });
      if (!dims.w || !dims.h) throw new Error('Could not decode image');

      let blob = file;
      let natW = dims.w;
      let natH = dims.h;
      /* GIF (animation) and SVG (vector) stay untouched; raster images larger
         than the cap are downscaled once so the editor and store stay fast. */
      if (mime !== 'image/gif' && mime !== 'image/svg+xml' && (dims.w > MAX_IMAGE_DIMENSION || dims.h > MAX_IMAGE_DIMENSION)) {
        const scale = Math.min(MAX_IMAGE_DIMENSION / dims.w, MAX_IMAGE_DIMENSION / dims.h);
        natW = Math.max(1, Math.round(dims.w * scale));
        natH = Math.max(1, Math.round(dims.h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = natW;
        canvas.height = natH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(await loadImageElement(objectUrl), 0, 0, natW, natH);
        blob = await new Promise((resolve) => canvas.toBlob(resolve, mime === 'image/png' ? 'image/png' : 'image/jpeg', 0.92));
        if (!blob) throw new Error('Could not process image');
      }

      const insertHost = imageInsertTarget()?.host;
      const available = Math.max(40, (insertHost?.clientWidth || editor?.clientWidth || 720) - 8);
      const width = Math.round(Math.min(natW, available));
      const height = Math.max(24, Math.round(width * (natH / natW)));
      return { blob, width, height, naturalWidth: natW, naturalHeight: natH };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function loadImageElement(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not decode image'));
      img.src = src;
    });
  }

  /* ---- Insert image at the caret (Word-style) ---- */
  let lastInsertedImage = null;

  /* Image insertion follows the active panel like every other formatting tool:
     the picture lands in the note you last clicked in. */
  function imageInsertTarget() {
    if (splitState && activePane === 'right') {
      const resolved = resolveRef(splitRefKey());
      if (!resolved) return null;
      return { item: resolved.item, host: splitEditorEl, pane: 'right' };
    }
    return { item: selectedItem()?.item || null, host: editor, pane: 'left' };
  }

  function insertImage() {
    const target = imageInsertTarget();
    if (!target?.item) { openNotice('No note open', 'Open a text note first, then insert the image.'); return; }
    if (target.item.language !== 'text') {
      openNotice('Images need a text note', 'Switch this note to Plain text to insert images between paragraphs.');
      return;
    }
    if (!target.host?.isContentEditable) {
      openNotice('Editor not ready', 'Click inside the note once, then try Insert Image again.');
      return;
    }
    /* Remember the caret (even a collapsed one) before the file dialog steals focus. */
    setSavedEditorSelectionForPicker();
    elements.imageInput.value = '';
    elements.imageInput.click();
  }

  function setSavedEditorSelectionForPicker() {
    const target = imageInsertTarget();
    if (!target?.host?.isContentEditable) { savedEditorSelection = null; savedSplitSelection = null; return; }
    const selection = window.getSelection();
    const range = selection?.rangeCount && target.host.contains(selection.getRangeAt(0).commonAncestorContainer)
      ? selection.getRangeAt(0).cloneRange()
      : null;
    if (target.pane === 'right') savedSplitSelection = range;
    else savedEditorSelection = range;
  }

  function insertionRangeFor(host, savedRange) {
    if (!host) return null;
    if (savedRange && host.contains(savedRange.commonAncestorContainer)) return savedRange;
    const selection = window.getSelection();
    if (selection?.rangeCount && host.contains(selection.getRangeAt(0).commonAncestorContainer)) return selection.getRangeAt(0);
    const range = document.createRange();
    range.selectNodeContents(host);
    range.collapse(false);
    return range;
  }

  function insertionRange() {
    return insertionRangeFor(editor, savedEditorSelection);
  }

  function insertImageMarkup(item, id, imageData) {
    const target = imageInsertTarget();
    const host = target?.host;
    /* If the active panel changed while the file dialog was open, do nothing
       rather than write the picture into the wrong note. */
    if (!host?.isContentEditable || target.item !== item) return;
    const img = document.createElement('img');
    img.className = 'qlx-image';
    img.dataset.imageId = id;
    img.dataset.width = String(imageData.width);
    img.dataset.height = String(imageData.height);
    img.dataset.naturalWidth = String(imageData.naturalWidth || imageData.width);
    img.dataset.naturalHeight = String(imageData.naturalHeight || imageData.height);
    img.src = URL.createObjectURL(imageData.blob);
    img.alt = 'Image';
    img.setAttribute('draggable', 'true');
    img.contentEditable = 'false';
    img.style.maxWidth = '100%';
    img.style.width = imageData.width + 'px';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '10px auto';

    const range = insertionRangeFor(host, target.pane === 'right' ? savedSplitSelection : savedEditorSelection);
    if (!range) return;
    /* Never delete a selected range: insert at its end so all text survives. */
    if (!range.collapsed) range.collapse(false);
    if (range.startContainer === host && range.startOffset >= host.childNodes.length) {
      host.appendChild(img);
    } else {
      try { range.insertNode(img); }
      catch (_) { host.appendChild(img); }
    }
    lastInsertedImage = img;
    item.richText = true;
    if (target.pane === 'right' && splitState) {
      commitSplitValue(normalizeRichEditorValue(host), true);
      if (activePane !== 'right') setActivePane('right');
      return;
    }
    commitEditorValue(editor.innerHTML);
    updateEditorStats();
  }

  function focusAfterImage() {
    const target = imageInsertTarget();
    const host = target?.host;
    if (!host?.isContentEditable) return;
    host.focus();
    const img = lastInsertedImage && host.contains(lastInsertedImage) ? lastInsertedImage : null;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    if (img) {
      range.setStartAfter(img);
    } else {
      range.selectNodeContents(host);
      range.collapse(false);
    }
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    if (target.pane === 'right') savedSplitSelection = null;
    else savedEditorSelection = null;
    if (selectedImage) deselectImage();
  }

  function initImageInteraction() {
    editor.addEventListener('click', (event) => {
      const img = event.target.closest('img.qlx-image');
      if (img && editor?.contains(img)) {
        event.preventDefault();
        event.stopPropagation();
        if (selectedImage === img) {
          const sel = window.getSelection();
          const range = document.createRange();
          range.setStartAfter(img);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          deselectImage();
        } else {
          selectImage(img);
        }
        return;
      }
      if (!event.target.closest('img.qlx-image')) deselectImage();
    });
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.isCollapsed) return;
        const range = sel.getRangeAt(0);
        const node = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.nextSibling : range.startContainer;
        if (node && node.nodeType === Node.ELEMENT_NODE && node.matches('img.qlx-image')) {
          if (editor.contains(node)) {
            event.preventDefault();
            deleteSelectedImage();
          }
        }
      }
      if (event.key === 'Enter' && selectedImage && editor?.contains(selectedImage)) {
        deselectImage();
      }
    }, true);
    editor.addEventListener('mousedown', (event) => {
      const img = event.target.closest('img.qlx-image');
      if (!img || !editor?.contains(img)) return;
      /* Keep direct image clicks from collapsing nearby text selection, but
         leave mousedown free for native drag — dragging must move images. */
      const selectionNow = window.getSelection();
      if (selectionNow?.isCollapsed) event.preventDefault();
    });
    /* Drag an image (desktop) to move it between text positions. Touch users
       still reposition via select → alignment panel. */
    var draggingImage = null;
    editor.addEventListener('dragstart', (event) => {
      const img = event.target?.closest?.('img.qlx-image');
      if (!img || !editor?.contains(img)) return;
      event.stopPropagation();
      draggingImage = img;
      img.classList.add('qlx-image-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        try { event.dataTransfer.setData('text/plain', ''); } catch (_) {}
      }
    });
    editor.addEventListener('dragover', (event) => {
      if (!draggingImage) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    });
    editor.addEventListener('drop', (event) => {
      if (!draggingImage) return;
      const img = draggingImage;
      draggingImage = null;
      event.preventDefault();
      img.classList.remove('qlx-image-dragging');
      if (!editor?.isContentEditable || !editor.contains(img)) return;
      let range = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(event.clientX, event.clientY);
        if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); }
      }
      if (!range || !editor.contains(range.startContainer)) return;
      if (range.startContainer === img || img.contains(range.startContainer)) return;
      try {
        img.remove();
        range.collapse(false);
        range.insertNode(img);
        commitEditorValue(editor.innerHTML);
        updateEditorStats();
        selectImage(img);
      } catch (_) {
        if (!editor.contains(img)) editor.appendChild(img);
        commitEditorValue(editor.innerHTML);
      }
    });
    editor.addEventListener('dragend', (event) => {
      if (draggingImage) {
        draggingImage.classList.remove('qlx-image-dragging');
        draggingImage = null;
      }
    });
    /* Overlay handles + panel follow the image while scrolling or resizing. */
    editor.addEventListener('scroll', () => { positionImageContextPanel(); positionResizeHandles(); }, { passive: true });
    window.addEventListener('resize', () => { positionImageContextPanel(); positionResizeHandles(); });
    bindResizeHandleEvents();
    positionImageContextPanel();
  }

  /* Document-level listeners are bound exactly once — the handle elements are
     static, while the editor element is recreated when notes are reopened.
     Declared as a var so initImageInteraction (invoked during page init, before
     this line executes) can read it without hitting the temporal dead zone. */
  var resizeHandleEventsBound = false;
  function bindResizeHandleEvents() {
    if (resizeHandleEventsBound) return;
    resizeHandleEventsBound = true;

    const pointOf = (event) => event.touches?.[0] || event.changedTouches?.[0] || event;
    const cornerFromEvent = (event) => event.target?.closest?.('[data-corner]')?.dataset.corner || null;

    const beginResize = (event) => {
      const corner = cornerFromEvent(event);
      if (!corner || !selectedImage || !editor?.contains(selectedImage)) return;
      const point = pointOf(event);
      const rect = selectedImage.getBoundingClientRect();
      event.preventDefault();
      resizeState = {
        img: selectedImage,
        active: true,
        corner,
        startX: point.clientX,
        startY: point.clientY,
        startW: rect.width,
        startH: rect.height,
        ratio: rect.height / rect.width || 1
      };
      document.body.style.cursor = (corner === 'se' || corner === 'nw') ? 'nwse-resize' : 'nesw-resize';
      document.body.style.userSelect = 'none';
    };

    elements.imageResizeHandles?.querySelectorAll('.qlx-image-resize-handle').forEach((handle) => {
      handle.addEventListener('mousedown', beginResize);
      handle.addEventListener('touchstart', beginResize, { passive: false });
    });

    document.addEventListener('mousemove', (event) => {
      if (!resizeState?.active) return;
      applyResize(event.clientX, event.clientY, Boolean(event.shiftKey));
    });
    document.addEventListener('mouseup', (event) => {
      if (!resizeState) return;
      if (resizeState.active) {
        applyResize(event.clientX, event.clientY, Boolean(event.shiftKey));
        finishResize();
      }
      resizeState = null;
    });
    document.addEventListener('touchmove', (event) => {
      if (!resizeState?.active) return;
      const point = pointOf(event);
      event.preventDefault();
      applyResize(point.clientX, point.clientY, false);
    }, { passive: false });
    const endTouchResize = (event) => {
      if (!resizeState) return;
      if (resizeState.active) {
        const point = pointOf(event);
        applyResize(point.clientX, point.clientY, false);
        finishResize();
      }
      resizeState = null;
    };
    document.addEventListener('touchend', endTouchResize);
    document.addEventListener('touchcancel', () => { if (resizeState) finishResize(); resizeState = null; });
  }

  function finishResize() {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (!resizeState) return;
    if (editor?.contains(resizeState.img)) {
      saveImageDimensions(resizeState.img);
      updateImageContextPanel();
      positionResizeHandles();
    }
  }

  /* Aspect ratio is preserved by default; holding Shift allows free resizing. */
  function applyResize(cx, cy, freeRatio) {
    if (!resizeState || !editor?.contains(resizeState.img)) return;
    const img = resizeState.img;
    const { startX, startY, startW, startH, corner, ratio } = resizeState;
    const dirX = (corner === 'nw' || corner === 'sw') ? -1 : 1;
    const dirY = (corner === 'nw' || corner === 'ne') ? -1 : 1;
    const dx = (cx - startX) * dirX;
    const dy = (cy - startY) * dirY;
    const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    const maxW = Math.max(48, editor.clientWidth - 4);
    let newW = Math.min(maxW, Math.max(48, startW + delta));
    if (freeRatio) {
      const newH = Math.max(32, startH + dy);
      img.style.width = newW + 'px';
      img.style.height = newH + 'px';
    } else {
      let newH = Math.max(32, Math.round(newW * ratio));
      const maxH = Math.max(32, editor.clientHeight - 4);
      if (newH > maxH) {
        newH = maxH;
        newW = Math.max(48, Math.round(newH / ratio));
      }
      img.style.width = newW + 'px';
      img.style.height = newH + 'px';
    }
    img.style.maxWidth = '100%';
    positionResizeHandles();
    positionImageContextPanel();
  }

  function withExtension(title, extension) {
    return getExtension(title) ? title : `${title}.${extension}`;
  }

  function safeFileName(name) {
    return cleanTitle(name).replace(/[<>:"/\\|?*]+/g, '-').slice(0, 120) || 'note.txt';
  }

  function download(data, filename, type) {
    saveExportBlob(new Blob([data], { type }), filename);
  }

  /* The Android WebView does not expose navigator.share/canShare, so the
     Capacitor native plugins are used on native platforms. They are reached
     through window.Capacitor.Plugins (registered natively at startup); every
     caller keeps its browser fallbacks if the handle is missing. */
  function nativeCapacitorPlugin(name) {
    const cap = window.Capacitor;
    if (!cap || typeof cap.isNativePlatform !== 'function' || !cap.isNativePlatform()) return null;
    const plugin = cap.Plugins && cap.Plugins[name];
    return plugin && typeof plugin.share === 'function' || plugin && typeof plugin.writeFile === 'function' ? plugin : null;
  }
  function shareErrorIsCancel(error) {
    const message = String(error && (error.message || error) || '').toLowerCase();
    return /cancel|abort|dismiss/.test(message);
  }
  /* Share a Blob through the native share sheet (WhatsApp, email, Drive,
     Save to Files…). Returns true when the sheet was shown; false lets the
     caller try its next strategy. */
  async function nativeShareFile(title, filename, blob) {
    const share = nativeCapacitorPlugin('Share');
    const fs = nativeCapacitorPlugin('Filesystem');
    if (!share || !fs) return false;
    try {
      const dataUrl = await blobToBase64(blob);
      if (!dataUrl) return false;
      const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
      const written = await fs.writeFile({ path: filename, data: base64, directory: 'CACHE' });
      if (!written || !written.uri) return false;
      await share.share({ title: title || filename, files: [written.uri] });
      return true;
    } catch (error) {
      if (shareErrorIsCancel(error)) return true; /* user closed the sheet */
      return false;
    }
  }
  /* Share plain text through the native share sheet. */
  async function nativeShareText(title, text) {
    const share = nativeCapacitorPlugin('Share');
    if (!share) return false;
    try {
      await share.share({ title: title || 'Quillix Notepad', text: String(text || '') });
      return true;
    } catch (error) {
      if (shareErrorIsCancel(error)) return true; /* user closed the sheet */
      return false;
    }
  }

  /* Anchor downloads are a silent no-op inside the Android WebView (Capacitor)
     — the file is never saved. On native platforms hand the file to the system
     share sheet instead, which offers Save/WhatsApp/Drive and always works.
     Desktop Electron has no Capacitor global, so it keeps the anchor path. */
  async function saveExportBlob(blob, filename) {
    const native = Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    if (native) {
      if (await nativeShareFile(filename, filename, blob)) return;
      const file = typeof File !== 'undefined' ? new File([blob], filename, { type: blob.type || 'application/octet-stream' }) : null;
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: filename });
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return; /* user closed the sheet */
        }
      }
      openNotice('Sharing unavailable', 'The system share sheet is not available on this device.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* Mobile Share button: HTML file through the system share sheet when the
     device supports it, plain text otherwise, clipboard as the last resort. */
  async function shareCurrentNote() {
    const selected = selectedItem();
    if (!selected) { openNotice('No note open', 'Open a note first, then share it.'); return; }
    let html = '';
    try { html = await exportPrintableHtmlAsync(selected.item); } catch (_) { /* fall back to text */ }
    const fileName = safeFileName(withExtension(selected.item.title, 'html'));
    if (html) {
      /* Native share sheet first on Android — WebView has no navigator.share. */
      if (await nativeShareFile(selected.item.title, fileName, new Blob([html], { type: 'text/html' }))) return;
      const file = new File([html], fileName, { type: 'text/html' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: selected.item.title });
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return; /* user cancelled */
        }
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: selected.item.title, text: notePlainText(selected.item) });
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    if (await nativeShareText(selected.item.title, notePlainText(selected.item))) return;
    /* Fallback: put the note text on the clipboard so it can be pasted anywhere. */
    try {
      await navigator.clipboard.writeText(notePlainText(selected.item));
      openNotice('Sharing unavailable', 'Sharing is not supported on this device, so the note was copied to the clipboard — paste it into any app.');
    } catch (_) {
      if (html) { saveExportBlob(new Blob([html], { type: 'text/html' }), fileName); }
      else openNotice('Share failed', 'This note could not be shared or copied.');
    }
  }

  function escapeHtml(value) {
    const node = document.createElement('div');
    node.textContent = value;
    return node.innerHTML;
  }

  function checkRecoveredDrafts() {
    const recoverable = [];
    for (const ref of Object.keys(drafts)) {
      const resolved = resolveRef(ref);
      if (!resolved || typeof drafts[ref]?.note !== 'string') { delete drafts[ref]; continue; }
      if (drafts[ref].note !== (resolved.item.note || '')) recoverable.push(resolved);
    }
    if (!recoverable.length) return;
    const names = recoverable.map((entry) => entry.item.title).slice(0, 3).join(', ');
    modalAction = { action: 'restoreDrafts' };
    openModal({
      title: 'Recover unsaved edits?',
      description: `Unsaved edits were found for: ${names}${recoverable.length > 3 ? ' and more' : ''}. Restore them into your notes?`,
      icon: '<i class="fa-solid fa-clock-rotate-left"></i>',
      confirm: 'Restore edits',
      noInput: true
    });
    recoverableRefs = recoverable.map((entry) => entry);
  }

  let recoverableRefs = [];

  function restoreDrafts() {
    recoverableRefs.forEach((entry) => {
      const key = refToString({ type: entry.type === 'subtopic' ? 'subtopic' : 'topic', topicId: entry.topic.id, subtopicId: entry.item.id });
      const draft = drafts[key];
      if (draft && typeof draft.note === 'string') entry.item.note = draft.note;
      delete drafts[key];
    });
    recoverableRefs = [];
    closeModal();
    render();
  }

  function snapshotHistory(ref, item) {
    const key = ref;
    const prior = item.note ?? '';
    const entries = Array.isArray(history[key]) ? history[key] : [];
    const last = entries[entries.length - 1];
    if (last && last.note === prior) return;
    entries.push({ note: prior, at: new Date().toISOString() });
    while (entries.length > Math.min(settings.historyLimit ?? 20, 20)) entries.shift();
    history[key] = entries;
    safeSetRaw(KEYS.history, JSON.stringify(history));
  }

  function moveToTrash(topic) {
    topics = topics.filter((item) => item.id !== topic.id);
    trash = [{ ...structuredClone(topic), deletedAt: new Date().toISOString() }, ...trash].slice(0, 100);
    recents = recents.filter((ref) => parseRef(ref).topicId !== topic.id);
    expanded = expanded.filter((id) => id !== topic.id);
    if (selectedRef.topicId === topic.id) {
      selectedRef = topics.length ? { type: 'topic', topicId: sortedTopics(topics)[0].id } : { type: 'topic', topicId: '' };
    }
    closeModal();
    render();
  }

  function restoreFromTrash(topicId) {
    const entry = trash.find((item) => item.id === topicId);
    if (!entry) return;
    const { deletedAt, ...topic } = entry;
    let title = topic.title;
    let number = 2;
    while (hasDuplicateTopic(title)) title = `${topic.title} restored ${number++}`;
    trash = trash.filter((item) => item.id !== topicId);
    topics.push({ ...topic, title });
    closeModal();
    render();
  }

  function purgeTrash() {
    trash = [];
    closeModal();
    render();
  }

  function archiveTopic(topic) {
    topics = topics.filter((item) => item.id !== topic.id);
    archived = [{ ...structuredClone(topic) }, ...archived].slice(0, 200);
    recents = recents.filter((ref) => parseRef(ref).topicId !== topic.id);
    if (selectedRef.topicId === topic.id) {
      selectedRef = topics.length ? { type: 'topic', topicId: sortedTopics(topics)[0].id } : { type: 'topic', topicId: '' };
    }
    closeModal();
    render();
  }

  function unarchiveTopic(topicId) {
    const entry = archived.find((item) => item.id === topicId);
    if (!entry) return;
    archived = archived.filter((item) => item.id !== topicId);
    let title = entry.title;
    let number = 2;
    while (hasDuplicateTopic(title)) title = `${entry.title} unarchived ${number++}`;
    topics.push({ ...entry, title });
    closeModal();
    render();
  }

  function openTrashManager() {
    modalAction = { action: 'manageTrash' };
    openDynamicManager({
      title: 'Trash',
      items: trash,
      empty: 'Trash is empty.',
      actionsHtml: (item) => `<button data-manager-action="restore" data-id="${item.id}">Restore</button><button data-manager-action="purge-one" data-id="${item.id}" class="danger">Delete forever</button>`,
      footerHtml: trash.length ? '<button class="danger" data-manager-action="purge-all">Empty trash</button>' : ''
    });
  }

  function openArchiveManager() {
    modalAction = { action: 'manageArchive' };
    openDynamicManager({
      title: 'Archive',
      items: archived,
      empty: 'Nothing archived yet.',
      actionsHtml: (item) => `<button data-manager-action="unarchive" data-id="${item.id}">Move back to notes</button>`,
      footerHtml: ''
    });
  }

  function openHistoryManager() {
    const selected = selectedItem();
    if (!selected) return;
    const key = refToString(selectedRef);
    const entries = history[key] || [];
    modalAction = { action: 'manageHistory', ref: key };
    openDynamicManager({
      title: `Version history — ${selected.item.title}`,
      items: entries.map((entry, index) => ({ id: String(index), title: new Date(entry.at).toLocaleString(), preview: entry.note.slice(0, 140) })),
      empty: 'No saved versions yet for this note.',
      actionsHtml: (entry) => `<button data-manager-action="restore-version" data-id="${entry.id}">Restore this version</button>`,
      footerHtml: ''
    });
  }

  function openDynamicManager(options) {
    elements.modalTitle.textContent = options.title;
    elements.modalDescription.textContent = '';
    elements.modalIcon.innerHTML = '<i class="fa-solid fa-box-archive"></i>';
    elements.modalConfirm.textContent = 'Close';
    elements.modalCancel.textContent = '';
    elements.modalCancel.classList.add('hidden');
    elements.modalInputWrap.classList.add('hidden');
    const listHtml = options.items.length
      ? options.items.map((item) => `
        <div class="manager-row">
          <div class="manager-item">
            <div class="manager-name">${escapeHtml(item.title)}</div>
            ${item.preview ? `<div class="manager-preview">${escapeHtml(item.preview)}</div>` : ''}
          </div>
          <div class="manager-actions">${options.actionsHtml(item)}</div>
        </div>`).join('')
      : `<p class="manager-empty">${escapeHtml(options.empty)}</p>`;
    const stage = $('#modalManagerStage');
    if (stage) stage.innerHTML = `${listHtml}<div class="manager-footer">${options.footerHtml || ''}</div>`;
    elements.modal.classList.add('show');
    elements.modal.setAttribute('aria-hidden', 'false');
  }

  function handleManagerClick(event) {
    const button = event.target.closest('[data-manager-action]');
    if (!button) return;
    const action = button.dataset.managerAction;
    const id = button.dataset.id;
    if (modalAction?.action === 'manageTrash') {
      if (action === 'restore') restoreFromTrash(id);
      else if (action === 'purge-one') {
        trash = trash.filter((item) => item.id !== id);
        saveNow();
        openTrashManager();
      } else if (action === 'purge-all') purgeTrash();
    } else if (modalAction?.action === 'manageArchive') {
      if (action === 'unarchive') unarchiveTopic(id);
    } else if (modalAction?.action === 'manageHistory') {
      if (action === 'restore-version') restoreHistoryVersion(modalAction.ref, Number(id));
    } else if (action === 'insert-image') {
      closeModal();
      insertImage();
    } else if (modalAction?.action === 'insertTemplate' && action === 'use-template') {
      const template = TEMPLATES.find((entry) => entry.id === id);
      const selected = selectedItem();
      if (template && selected && selected.item.language === 'text' && !selected.item.richText) {
        setEditorValue(template.content);
        commitEditorValue(template.content);
        closeModal();
      } else if (selected?.item.richText) {
        openNotice('Cannot insert template', 'Templates replace the whole note. This note contains images — use Insert Image to add more.');
      }
    }
  }

  function restoreHistoryVersion(ref, index) {
    const entries = history[ref] || [];
    const entry = entries[index];
    if (!entry) return;
    const resolved = resolveRef(ref);
    if (!resolved) return;
    resolved.item.note = entry.note;
    resolved.item.updatedAt = new Date().toISOString();
    closeModal();
    render();
  }

  function insertPromptTemplate() {
    const selected = selectedItem();
    if (!selected || selected.item.language !== 'text') return;
    const hasImages = Boolean(selected.item.richText);
    modalAction = { action: 'insertTemplate' };
    openDynamicManager({
      title: hasImages ? 'Insert into note' : 'Insert a template',
      items: hasImages ? [] : TEMPLATES.map((template) => ({ ...template, id: template.id, label: template.id })),
      empty: 'Images are inserted from the toolbar or here.',
      actionsHtml: (template) => `<button data-manager-action="use-template" data-id="${template.id}">Use template</button>`,
      footerHtml: '<button data-manager-action="insert-image"><i class="fa-solid fa-image"></i> Insert image</button>'
    });
  }

  async function importImageFromFiles(event) {
    const files = [...event.target.files];
    if (!files.length) return;
    event.target.value = '';
    const target = imageInsertTarget();
    if (!target?.item) return;
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      openNotice('Not an image', 'Please choose a PNG, JPG, WebP, or GIF image.');
      return;
    }
    try {
      const id = imageId();
      const imageData = await loadImageFile(file);
      await putImage(id, imageData.blob);
      insertImageMarkup(target.item, id, imageData);
      focusAfterImage();
    } catch (error) {
      if (/abort/i.test(String(error))) return;
      if (/too large/i.test(String(error))) { openNotice('Image too large', 'Choose an image smaller than 25 MB.'); return; }
      openNotice('Could not insert image', 'The image could not be read. Try another file.');
    }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    const onNative = Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    if (onNative) {
      /* The native app ships every asset inside the APK, so a service worker
         can only ever pin stale copies. Worse: on an app UPDATE the WebView
         keeps the previous install's cache-first worker and its cached shell,
         so fixes in a new APK never reached the phone. Unregister any leftover
         worker and clear our caches so an update takes effect on first launch. */
      navigator.serviceWorker.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch(() => {});
      if (typeof caches !== 'undefined' && caches.keys) {
        caches.keys().then((keys) => {
          keys.filter((key) => key.startsWith('quillix-notepad-')).forEach((key) => caches.delete(key));
        }).catch(() => {});
      }
      return;
    }
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  /* ── Split view: two independent notes side by side ──────────────────────
     The left pane is always the primary editor bound to selectedRef. The right
     pane owns its own editor instance and writes straight to the note it
     resolves from splitState.ref, so edits never cross over: commitEditorValue()
     only ever touches selectedItem(), and the right pane never calls it. */
  /* Split view state lives with the other module state (see the let block near
     initialize()) so nothing reaches it from the temporal dead zone. */
  function splitRefKey() { return splitState?.ref || ''; }

  function listAllRefs() {
    const refs = [];
    sortedTopics(topics).forEach((topic) => {
      refs.push({ ref: refToString({ type: 'topic', topicId: topic.id }), title: topic.title, icon: 'fa-file-lines' });
      sortedSubtopics(topic.subtopics).forEach((subtopic) => {
        refs.push({
          ref: refToString({ type: 'subtopic', topicId: topic.id, subtopicId: subtopic.id }),
          title: `${topic.title} / ${subtopic.title}`,
          icon: 'fa-code'
        });
      });
    });
    return refs;
  }

  function openSplitView(ref) {
    if (!isDesktopLayout()) { openNotice('Split view is desktop only', 'Widen the window or use a desktop screen to compare two notes side by side.'); return; }
    const target = ref || listAllRefs().map((entry) => entry.ref).find((candidate) => candidate !== refToString(selectedRef));
    if (!target || !resolveRef(target)) {
      openNotice('Nothing to split', 'Create a second note, then open it in split view to compare them.');
      return;
    }
    /* Two panes showing the same note would look broken and defeat the point. */
    splitState = { ref: target === refToString(selectedRef)
      ? (listAllRefs().map((entry) => entry.ref).find((candidate) => candidate !== refToString(selectedRef)) || target)
      : target };
    /* Both panels start on the same editor theme. A note that already carries
       its own theme keeps it, so nothing the user set earlier is overwritten. */
    const rightItem = resolveRef(splitRefKey())?.item;
    if (rightItem && !validEditorTheme(rightItem.editorTheme)) rightItem.editorTheme = mainEditorTheme();
    markdownPreviewOpen = false;
    updateMarkdownPreview();
    elements.editorFrame.classList.add('split-active');
    $('#splitDivider').classList.remove('hidden');
    $('#splitPane').classList.remove('hidden');
    $('#splitLeftBar')?.classList.remove('hidden');
    $('#splitViewButton').classList.add('active');
    $('#splitViewButton').setAttribute('aria-pressed', 'true');
    activePane = 'left';
    renderSplitPane();
    renderSplitLeftBar();
    setActivePane('left');
  }

  function closeSplitView() {
    if (!splitState) return;
    destroySplitPaneEditor();
    splitState = null;
    /* Back to a normal single-note editor: both panels are gone, no pane state
       is left behind, and the primary note is focused again. */
    elements.editorFrame.classList.remove('split-active');
    elements.editorFrame.style.removeProperty('--split-left');
    elements.editorFrame.style.removeProperty('--split-right');
    elements.editorFrame.removeAttribute('data-active-pane');
    $('#splitLeftBar')?.classList.add('hidden');
    $('#splitLeftTheme')?.classList.remove('active');
    $('#splitDivider').classList.add('hidden');
    $('#splitPane').classList.add('hidden');
    $('#splitPane').innerHTML = '';
    $('#splitViewButton').classList.remove('active');
    $('#splitViewButton').setAttribute('aria-pressed', 'false');
    activePane = 'left';
    /* Pressing a panel's close control first marks that panel active (the
       activation handler runs on mousedown), so the toolbar may still show
       the closing note's theme/language. Re-sync it to the note the single
       editor is about to show, otherwise the theme picker would display the
       other note's theme even though the editor paints this one. */
    const mainItem = selectedItem()?.item;
    if (mainItem) {
      elements.language.value = mainItem.language || 'text';
      elements.editorTheme.value = storedEditorTheme(mainItem);
      elements.languageStatus.textContent = (LANGUAGE_BY_ID.get(mainItem.language) || MAIN_LANGUAGE).label;
    }
    syncWordWrapButton();
    applyEditorSettings();
    setTimeout(() => { if (codeMirror) codeMirror.refresh(); focusEditor(); }, 0);
  }

  function toggleSplitView() { if (splitState) closeSplitView(); else openSplitView(); }

  /* Close the left panel by keeping the note you were reading on the right:
     it is promoted into the single-note editor instead of being discarded. */
  function closeLeftPane() {
    if (!splitState) { closeSplitView(); return; }
    const parsed = parseRef(splitRefKey());
    closeSplitView();
    if (parsed.type === 'subtopic' && parsed.subtopicId) selectSubtopic(parsed.topicId, parsed.subtopicId, 'main');
    else if (parsed.topicId) selectTopic(parsed.topicId, 'main');
  }

  function destroySplitPaneEditor() {
    if (splitCodeMirror) { splitCodeMirror.toTextArea(); splitCodeMirror = null; }
    splitColorMarks.forEach((mark) => { try { mark.clear(); } catch (_) {} });
    splitColorMarks = [];
    splitEditorEl = null;
    savedSplitSelection = null;
  }

  /* The left panel's own header: the note's name, its theme picker and a close
     button, all inside the panel and separate from the main note tabs. */
  function renderSplitLeftBar() {
    const bar = $('#splitLeftBar');
    if (!bar) return;
    if (!splitState) { bar.classList.add('hidden'); return; }
    const item = selectedItem()?.item;
    if (!item) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    const title = $('#splitLeftTitle');
    if (title) {
      title.textContent = item.title || 'Untitled';
      title.title = item.title || 'Untitled';
    }
    const theme = $('#splitLeftTheme');
    if (theme) {
      const value = storedEditorTheme(item);
      if (!theme.dataset.ready) {
        theme.innerHTML = editorThemeOptionsHtml(value);
        theme.dataset.ready = '1';
      } else {
        theme.value = value;
      }
      theme.disabled = Boolean(item.locked && item.vault);
    }
  }

  function editorThemeOptionsHtml(selected) {
    return [...elements.editorTheme.options].map((option) =>
      `<option value="${escapeHtml(option.value)}"${option.value === selected ? ' selected' : ''}>${escapeHtml(option.textContent)}</option>`).join('');
  }

  /* Rebuild only the header (title, theme). Keeps the right pane's
     editor instance — and therefore its cursor — alive across list updates. */
  function refreshSplitPaneHeader() {
    if (!splitState) return;
    const resolved = resolveRef(splitRefKey());
    const titleEl = $('#splitPaneTitle');
    if (!titleEl) { renderSplitPane(); return; }
    const options = listAllRefs();
    if (!options.some((entry) => entry.ref === splitRefKey())) {
      /* The right-hand note was deleted or archived — recover gracefully. */
      if (resolved) splitState.ref = options[0]?.ref || '';
      else { closeSplitView(); return; }
    }
    titleEl.textContent = resolved?.item.title || 'Untitled';
    titleEl.title = resolved?.item.title || 'Untitled';
    const theme = $('#splitPaneTheme');
    if (theme) theme.value = storedEditorTheme(resolved?.item);
    renderSplitLeftBar();
  }

  function renderSplitPane() {
    if (!splitState) return;
    const pane = $('#splitPane');
    const resolved = resolveRef(splitRefKey());
    destroySplitPaneEditor();
    if (!resolved) { closeSplitView(); return; }
    const item = resolved.item;
    const locked = Boolean(item.locked && item.vault);
    const paneTheme = storedEditorTheme(item);

    /* No note picker here: which note a pane shows follows the panel the user
       last clicked (sidebar notes open in the active panel). Both panels now
       expose the same controls — title, theme picker, close. */
    pane.innerHTML = `
      <div class="split-pane-bar">
        <span class="split-pane-title" id="splitPaneTitle" title="${escapeHtml(item.title)}">${escapeHtml(item.title || 'Untitled')}</span>
        <select class="select-control split-pane-theme" id="splitPaneTheme" aria-label="Right panel editor theme">
          ${editorThemeOptionsHtml(paneTheme)}
        </select>
        <button class="icon-button split-pane-close" id="splitPaneClose" type="button" title="Close this panel" aria-label="Close this panel"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="split-pane-body" id="splitPaneBody" data-editor-theme="${escapeHtml(paneTheme)}" style="--editor-font-size: ${paneFontSize(item)}px"></div>`;

    $('#splitPaneTheme').addEventListener('change', (event) => setPaneTheme('right', event.target.value));
    $('#splitPaneClose').addEventListener('click', closeSplitView);

    const body = $('#splitPaneBody');
    if (locked) {
      body.innerHTML = '<div class="split-pane-empty"><i class="fa-solid fa-lock"></i>&nbsp; This note is locked.</div>';
      return;
    }

    const useCodeMirror = item.language !== 'text' && window.CodeMirror;
    if (useCodeMirror) {
      body.innerHTML = '<textarea id="splitPaneSource"></textarea>';
      splitCodeMirror = window.CodeMirror.fromTextArea($('#splitPaneSource'), {
        value: item.note || '',
        lineWrapping: paneWordWrap(item),
        tabSize: settings.tabSize,
        indentUnit: settings.tabSize,
        indentWithTabs: false,
        smartIndent: true,
        lineNumbers: settings.lineNumbers !== false,
        theme: CODE_MIRROR_THEMES[paneTheme] || 'default',
        mode: modeForLanguage(item.language)
      });
      splitSuppress = true;
      splitCodeMirror.setValue(item.note || '');
      splitSuppress = false;
      splitCodeMirror.on('change', handleSplitCodeMirrorChange);
      splitCodeMirror.setSize('100%', '100%');
      /* The right note keeps its own colour marks, just like the main editor. */
      splitColorMarks = (item.textColors || []).map((mark) => splitCodeMirror.markText(
        splitCodeMirror.posFromIndex(mark.start),
        splitCodeMirror.posFromIndex(mark.end),
        { css: `color: ${mark.color}` }
      ));
      setTimeout(() => splitCodeMirror?.refresh(), 0);
    } else {
      /* Rich/plain notes reuse the same contenteditable model as the primary
         editor so stored HTML round-trips unchanged — no data loss. */
      const el = document.createElement('div');
      el.className = 'rich-editor';
      el.contentEditable = 'true';
      el.setAttribute('role', 'textbox');
      el.setAttribute('aria-multiline', 'true');
      el.dataset.placeholder = EDITOR_PLACEHOLDER;
      el.style.fontSize = `${paneFontSize(item)}px`;
      el.style.whiteSpace = paneWordWrap(item) ? 'pre-wrap' : 'pre';
      el.innerHTML = item.richText
        ? String(item.note || '').replace(/\s+src="blob:[^"]*"/g, '')
        : escapeHtml(item.note || '').replace(/\r?\n/g, '<br>');
      el.addEventListener('input', handleSplitEditorInput);
      body.appendChild(el);
      splitEditorEl = el;
      hydrateImageElements(el);
    }
  }

  /* Applies the right note's own theme, size and wrap to its pane without
     rebuilding the editor, so cursor and scroll position survive. */
  function applySplitPaneAppearance() {
    if (!splitState) return;
    const item = resolveRef(splitRefKey())?.item;
    if (!item) return;
    const theme = storedEditorTheme(item);
    const body = $('#splitPaneBody');
    if (body) {
      body.dataset.editorTheme = theme;
      body.style.setProperty('--editor-font-size', `${paneFontSize(item)}px`);
    }
    if (splitCodeMirror) {
      splitCodeMirror.setOption('theme', CODE_MIRROR_THEMES[theme] || 'default');
      splitCodeMirror.setOption('lineWrapping', paneWordWrap(item));
      setTimeout(() => splitCodeMirror?.refresh(), 0);
    } else if (splitEditorEl) {
      splitEditorEl.style.fontSize = `${paneFontSize(item)}px`;
      splitEditorEl.style.whiteSpace = paneWordWrap(item) ? 'pre-wrap' : 'pre';
    }
    const themeSelect = $('#splitPaneTheme');
    if (themeSelect) themeSelect.value = theme;
  }

  /* Each panel's theme picker writes to its own note, so the other note keeps
     exactly the appearance it was showing. */
  function setPaneTheme(pane, theme) {
    if (!validEditorTheme(theme)) return;
    const item = pane === 'right' ? resolveRef(splitRefKey())?.item : selectedItem()?.item;
    if (!item) return;
    item.editorTheme = theme;
    item.updatedAt = new Date().toISOString();
    if (pane === 'right') {
      applySplitPaneAppearance();
      if (splitState && activePane === 'right') elements.editorTheme.value = theme;
    } else {
      applyEditorTheme(theme);
      const other = $('#splitPaneTheme');
      if (other) other.value = storedEditorTheme(resolveRef(splitRefKey())?.item);
      renderSplitLeftBar();
    }
    saveNow();
  }

  /* Marks the panel the toolbar acts on. The other panel keeps its own theme,
     size and formatting exactly as it was. */
  function setActivePane(pane) {
    if (!splitState) { activePane = 'left'; return; }
    activePane = pane === 'right' ? 'right' : 'left';
    elements.editorFrame.dataset.activePane = activePane;
    $('#splitLeftBar')?.classList.toggle('active', activePane === 'left');
    $('#splitPane').querySelector('.split-pane-bar')?.classList.toggle('active', activePane === 'right');
    const item = activePaneItem();
    if (item) {
      elements.language.value = item.language || 'text';
      elements.editorTheme.value = storedEditorTheme(item);
      elements.languageStatus.textContent = (LANGUAGE_BY_ID.get(item.language) || MAIN_LANGUAGE).label;
    }
    syncWordWrapButton();
  }

  function handleSplitCodeMirrorChange(instance) {
    if (splitSuppress) return;
    commitSplitValue(instance.getValue(), false);
  }

  function handleSplitEditorInput() {
    if (!splitEditorEl) return;
    const html = normalizeRichEditorValue(splitEditorEl);
    commitSplitValue(html, Boolean(html));
  }

  /* Write straight to the note the right pane is bound to. Deliberately bypasses
     commitEditorValue() so the primary note is never touched by right-pane edits. */
  function commitSplitValue(value, richText) {
    const resolved = resolveRef(splitRefKey());
    if (!resolved) return;
    const nextValue = String(value ?? '');
    resolved.item.richText = Boolean(richText);
    resolved.item.note = nextValue;
    resolved.item.updatedAt = new Date().toISOString();
    if (resolved.type === 'subtopic') resolved.topic.updatedAt = resolved.item.updatedAt;
    drafts[splitRefKey()] = { note: nextValue, saved: Date.now() };
    safeSetRaw(KEYS.drafts, JSON.stringify(drafts));
    renderTopicList();
    markSaving();
    if (settings.autosave) scheduleSave();
  }

  /* The right pane's editor theme now comes from its own note, so a toolbar or
     Settings change only refreshes that pane's layout — it never repaints the
     other note's palette. */
  function syncSplitTheme() {
    if (splitCodeMirror) setTimeout(() => splitCodeMirror?.refresh(), 0);
  }

  function syncSplitEditorSettings() {
    const item = splitState ? resolveRef(splitRefKey())?.item : null;
    if (splitCodeMirror) {
      splitCodeMirror.setOption('lineWrapping', paneWordWrap(item));
      splitCodeMirror.setOption('tabSize', settings.tabSize);
      splitCodeMirror.setOption('indentUnit', settings.tabSize);
      setTimeout(() => splitCodeMirror?.refresh(), 0);
    } else if (splitEditorEl) {
      splitEditorEl.style.fontSize = `${paneFontSize(item)}px`;
      splitEditorEl.style.whiteSpace = paneWordWrap(item) ? 'pre-wrap' : 'pre';
    }
  }

  /* ------------------------------------------------------------------
     Desktop drag and drop for split view.

     Sources: a note row in the left panel, or an open note tab.
     Targets: the editor area (one pane when split view is open, otherwise the
     whole workspace — dropping there creates the split), or the empty
     workspace, where it simply opens the note.
     A split pane is only ever created by an explicit right-click action, the
     toolbar button, or a drop like this — never on its own.
     ------------------------------------------------------------------ */
  function bindNoteDragAndDrop() {
    let dragRef = '';

    const indicator = document.createElement('div');
    indicator.className = 'split-drop-indicator hidden';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.innerHTML = '<span></span>';
    document.body.appendChild(indicator);
    const indicatorLabel = indicator.querySelector('span');

    const refFromSidebar = (target) => {
      const card = target.closest('.topic-card[data-topic-id]');
      if (!card?.dataset.topicId) return '';
      return refToString(card.dataset.subtopicId
        ? { type: 'subtopic', topicId: card.dataset.topicId, subtopicId: card.dataset.subtopicId }
        : { type: 'topic', topicId: card.dataset.topicId });
    };

    const startDrag = (event) => {
      /* Touch devices scroll by finger — never start an HTML5 drag there. */
      if (!isDesktopLayout()) { event.preventDefault(); return; }
      const tab = event.target.closest('[data-note-tab]');
      let ref = '';
      if (tab) {
        /* The tab's ✕ stays a click target, not a drag handle. */
        if (event.target.closest('[data-close-tab]')) { event.preventDefault(); return; }
        ref = tab.dataset.noteTab || '';
      } else {
        /* Buttons on a sidebar row (menu, actions, chevron) stay click-only. */
        if (event.target.closest('button')) { event.preventDefault(); return; }
        ref = refFromSidebar(event.target);
      }
      if (!ref || !resolveRef(ref)) { event.preventDefault(); return; }
      dragRef = ref;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        try { event.dataTransfer.setData('text/plain', resolveRef(ref).item.title || 'Note'); } catch (_) {}
      }
    };

    /* Which pane the pointer is over: split view splits at the divider, a
       single editor offers one target — create the split on drop. */
    const zoneFrom = (event) => {
      if (!isDesktopLayout() || !dragRef) return '';
      if (event.currentTarget === elements.emptyState) return 'empty';
      if (event.currentTarget !== elements.editorArea) return '';
      if (!splitState) return 'create';
      const frameRect = elements.editorFrame.getBoundingClientRect();
      const divider = $('#splitDivider');
      const dividerRect = divider && !divider.classList.contains('hidden')
        ? divider.getBoundingClientRect()
        : null;
      const mid = dividerRect ? dividerRect.left + dividerRect.width / 2 : frameRect.left + frameRect.width / 2;
      return event.clientX < mid ? 'left' : 'right';
    };

    const hideIndicator = () => {
      indicator.classList.add('hidden');
      elements.emptyState.classList.remove('drop-active');
    };

    const showIndicator = (zone) => {
      if (zone === 'empty') {
        hideIndicator();
        elements.emptyState.classList.add('drop-active');
        return;
      }
      elements.emptyState.classList.remove('drop-active');
      let rect;
      if (zone === 'create') {
        rect = elements.editorFrame.getBoundingClientRect();
      } else {
        const pane = (zone === 'right' ? $('#splitPane') : $('#editorHost'))
          || elements.editorFrame;
        rect = pane.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4) rect = elements.editorFrame.getBoundingClientRect();
      }
      indicator.style.left = `${rect.left + 8}px`;
      indicator.style.top = `${rect.top + 8}px`;
      indicator.style.width = `${Math.max(96, rect.width - 16)}px`;
      indicator.style.height = `${Math.max(64, rect.height - 16)}px`;
      indicatorLabel.textContent = zone === 'create'
        ? 'Drop to open this note in split view'
        : 'Drop to open this note here';
      indicator.classList.remove('hidden');
    };

    const openDroppedRef = (ref) => {
    const parsed = parseRef(ref);
    if (parsed.type === 'subtopic') selectSubtopic(parsed.topicId, parsed.subtopicId, 'main');
    else selectTopic(parsed.topicId, 'main');
  };

    /* Place the dragged note in the zone that was dropped on. */
    const applyDrop = (ref, zone) => {
      if (!resolveRef(ref)) return;
      const leftRef = refToString(selectedRef);
      if (zone === 'empty') { openDroppedRef(ref); return; }
      if (zone === 'create') {
        /* Dropping into a single editor is the explicit request for a split. */
        if (ref === leftRef) return;
        openSplitView(ref);
        setActivePane('right');
        return;
      }
      const rightRef = splitRefKey();
      if (zone === 'right') {
        if (ref === rightRef) return;
        if (ref === leftRef) {
          /* The dragged note is the one the left pane shows: swap the panes
             instead of putting the same note on both sides. */
          splitState.ref = leftRef;
          openDroppedRef(rightRef);
          renderSplitPane();
        } else {
          splitState.ref = ref;
          renderSplitPane();
        }
        refreshSplitPaneHeader();
        setActivePane('right');
        return;
      }
      /* zone === 'left' */
      if (ref === leftRef) return;
      if (ref === rightRef) {
        splitState.ref = leftRef;
        openDroppedRef(ref);
        renderSplitPane();
      } else {
        openDroppedRef(ref);
      }
      setActivePane('left');
    };

    const handleDragOver = (event) => {
      const zone = zoneFrom(event);
      if (!zone) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      showIndicator(zone);
    };

    const handleDrop = (event) => {
      const zone = zoneFrom(event);
      const ref = dragRef;
      hideIndicator();
      dragRef = '';
      if (!zone || !ref) return;
      event.preventDefault();
      event.stopPropagation();
      applyDrop(ref, zone);
    };

    const handleDragLeave = (event) => {
      if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return;
      hideIndicator();
    };

    elements.topicList.addEventListener('dragstart', startDrag);
    elements.noteTabs.addEventListener('dragstart', startDrag);
    [elements.editorArea, elements.emptyState].forEach((zone) => {
      zone.addEventListener('dragover', handleDragOver);
      zone.addEventListener('drop', handleDrop);
      zone.addEventListener('dragleave', handleDragLeave);
    });
    /* A drag that ends anywhere else (or a drop outside the editor) must never
       leave the indicator on screen. */
    document.addEventListener('dragend', hideIndicator);
    document.addEventListener('drop', hideIndicator);
  }

  function bindSplitDividerDrag() {
    const divider = $('#splitDivider');
    if (!divider) return;
    divider.addEventListener('mousedown', (event) => {
      if (!splitState) return;
      event.preventDefault();
      event.stopPropagation();
      document.body.classList.add('split-resizing');
      document.body.style.cursor = 'col-resize';
      const frame = elements.editorFrame;
      const rect = frame.getBoundingClientRect();
      /* Clamp so neither pane can be squeezed to nothing and cover the other. */
      const MIN = 0.2;
      const onMove = (ev) => {
        const ratio = Math.min(1 - MIN, Math.max(MIN, (ev.clientX - rect.left) / rect.width));
        /* fr values: the frame's grid columns read them straight from CSS. */
        frame.style.setProperty('--split-left', `${ratio}fr`);
        frame.style.setProperty('--split-right', `${1 - ratio}fr`);
        if (splitCodeMirror) splitCodeMirror.refresh();
        if (codeMirror) codeMirror.refresh();
      };
      const onUp = () => {
        document.body.classList.remove('split-resizing');
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (splitCodeMirror) splitCodeMirror.refresh();
        if (codeMirror) codeMirror.refresh();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    divider.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const frame = elements.editorFrame;
      const rect = frame.getBoundingClientRect();
      const currentLeft = parseFloat(getComputedStyle(frame).getPropertyValue('--split-left')) || 0.5;
      const step = (event.shiftKey ? 48 : 16) / rect.width;
      const next = Math.min(0.8, Math.max(0.2, currentLeft + (event.key === 'ArrowRight' ? step : -step)));
      frame.style.setProperty('--split-left', `${next}fr`);
      frame.style.setProperty('--split-right', `${1 - next}fr`);
      if (splitCodeMirror) splitCodeMirror.refresh();
      if (codeMirror) codeMirror.refresh();
    });
  }
})();
