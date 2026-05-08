export const buildTableExportJavaScript = (filename: string) => `
  (function() {
    if (window.__rnTableExportInstalled_${filename.replace(/[^a-zA-Z0-9]/g, '_')}) {
      return true;
    }
    window.__rnTableExportInstalled_${filename.replace(/[^a-zA-Z0-9]/g, '_')} = true;

    const csvEscape = function(value) {
      const text = String(value || '').replace(/\\s+/g, ' ').trim();
      return '"' + text.replace(/"/g, '""') + '"';
    };

    const getVisibleText = function(element) {
      return (element && (element.innerText || element.textContent || '')) || '';
    };

    const getBestTable = function() {
      const tables = Array.from(document.querySelectorAll('table'));
      return tables.find(function(table) {
        return table.offsetParent !== null && table.querySelectorAll('tr').length > 1;
      }) || tables[0];
    };

    const buildCsvFromTable = function(table) {
      if (!table) return '';

      const rows = Array.from(table.querySelectorAll('tr'));
      if (!rows.length) return '';

      const headerCells = Array.from(rows[0].querySelectorAll('th,td'));
      const includedIndexes = headerCells
        .map(function(cell, index) {
          const label = getVisibleText(cell).toLowerCase();
          if (!label || label === 'actions' || label === 'action') return -1;
          return index;
        })
        .filter(function(index) {
          return index >= 0;
        });

      const csvRows = rows
        .map(function(row) {
          const cells = Array.from(row.querySelectorAll('th,td'));
          return includedIndexes.map(function(index) {
            return csvEscape(getVisibleText(cells[index]));
          }).join(',');
        })
        .filter(function(rowText) {
          return rowText.replace(/["',]/g, '').trim().length > 0;
        });

      return csvRows.join('\\n');
    };

    const exportTable = function() {
      const content = buildCsvFromTable(getBestTable());

      if (!content || !window.ReactNativeWebView) {
        return false;
      }

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'EXPORT_CSV',
          data: {
            filename: '${filename}',
            content: content,
          },
        }),
      );

      return true;
    };

    document.addEventListener(
      'click',
      function(event) {
        const target =
          event.target && event.target.nodeType === 1
            ? event.target
            : event.target?.parentElement;
        const button = target && target.closest && target.closest('button, a, [role="button"]');

        if (!button) return;

        const buttonText = getVisibleText(button).toLowerCase();
        if (buttonText !== 'export') return;

        if (exportTable()) {
          event.preventDefault();
          event.stopPropagation();
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        }
      },
      true,
    );

    return true;
  })();
  true;
`;
