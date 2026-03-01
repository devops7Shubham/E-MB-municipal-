import React, { useEffect, useRef, useState } from 'react';
import { Univer, UniverInstanceType, LocaleType, Tools } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { defaultTheme } from '@univerjs/themes';
import * as XLSX from 'xlsx';

import DesignEnUS from '@univerjs/design/locale/en-US';
import UIEnUS from '@univerjs/ui/locale/en-US';
import SheetsEnUS from '@univerjs/sheets-ui/locale/en-US';
import SheetsFormulaEnUS from '@univerjs/sheets-formula-ui/locale/en-US';
import SheetsNumfmtEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US';

interface UniverEditorProps {
  fileBlob?: Blob | null;
  readOnly?: boolean;
}

function buildWorkbookData(jsonData: any[][]): object {
  const cellData: Record<number, Record<number, { v: any; t?: number }>> = {};

  jsonData.forEach((row, r) => {
    cellData[r] = {};
    (row as any[]).forEach((cell, c) => {
      if (cell !== null && cell !== undefined && cell !== '') {
        cellData[r][c] = { v: cell, t: typeof cell === 'number' ? 2 : 1 };
      }
    });
  });

  return {
    id: 'emb-workbook',
    locale: LocaleType.EN_US,
    name: 'Measurement Book',
    sheetOrder: ['sheet-1'],
    sheets: {
      'sheet-1': {
        id: 'sheet-1',
        name: 'MB Sheet',
        rowCount: Math.max(jsonData.length + 10, 50),
        columnCount: 30,
        cellData,
      },
    },
  };
}

export function UniverEditor({ fileBlob, readOnly = false }: UniverEditorProps) {
  // wrapperRef is a plain div React owns — it never has React children
  const wrapperRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<Univer | null>(null);
  // univerContainerEl is created manually, outside React's reconciler
  const univerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wrapperRef.current || univerRef.current) return;

    // Create a div that React will NEVER know about
    const container = document.createElement('div');
    container.style.height = '100%';
    container.style.width = '100%';
    wrapperRef.current.appendChild(container);
    univerContainerRef.current = container;

    try {
      const locale = Tools.deepMerge(
        {},
        DesignEnUS,
        UIEnUS,
        SheetsEnUS,
        SheetsFormulaEnUS,
        SheetsNumfmtEnUS
      );

      const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: locale },
        theme: defaultTheme,
      });

      univer.registerPlugin(UniverRenderEnginePlugin);
      univer.registerPlugin(UniverFormulaEnginePlugin);

      univer.registerPlugin(UniverUIPlugin, {
        container,         // ← the manually-created element, not a React ref
        header: true,
        toolbar: true,
        footer: true,
      });

      univer.registerPlugin(UniverDocsPlugin, { hasScroll: false });
      univer.registerPlugin(UniverDocsUIPlugin);
      univer.registerPlugin(UniverSheetsPlugin);
      univer.registerPlugin(UniverSheetsUIPlugin);
      univer.registerPlugin(UniverSheetsFormulaPlugin);
      univer.registerPlugin(UniverSheetsFormulaUIPlugin);
      univer.registerPlugin(UniverSheetsNumfmtPlugin);
      univer.registerPlugin(UniverSheetsNumfmtUIPlugin);

      // univer.createUnit(UniverInstanceType.UNIVER_SHEET, buildWorkbookData([]));
      univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
          id: 'emb-workbook',
          locale: LocaleType.EN_US,
          name: 'MB Test',
          sheetOrder: ['mb-sheet', 'abstract-sheet'],
          sheets: {
            'mb-sheet': {
              id: 'mb-sheet',
              name: 'MB',
              rowCount: 20,
              columnCount: 10,
              cellData: {
                0: { 0: { v: 'Item', t: 1 }, 1: { v: 'Quantity', t: 1 } },
                1: { 0: { v: 'Earthwork', t: 1 }, 1: { v: 100, t: 2 } },
                2: { 0: { v: 'Concrete', t: 1 },  1: { v: 250, t: 2 } },
                3: { 0: { v: 'Brickwork', t: 1 }, 1: { v: 75, t: 2 } },
                4: { 0: { v: 'Total', t: 1 },     1: { f: '=SUM(B2:B4)', v: 425, t: 2 } },
              },
            },
            'abstract-sheet': {
              id: 'abstract-sheet',
              name: 'Abstract',
              rowCount: 20,
              columnCount: 10,
              cellData: {
                0: { 0: { v: 'Source', t: 1 },      1: { v: 'Value', t: 1 } },
                1: { 0: { v: 'MB Total Qty', t: 1 }, 1: { f: "='MB'!B5", v: 425, t: 2 } },
                2: { 0: { v: 'Rate (₹)', t: 1 },     1: { v: 1500, t: 2 } },
                3: { 0: { v: 'Amount (₹)', t: 1 },   1: { f: '=B2*B3', v: 637500, t: 2 } },
              },
            },
          },
        });

      univerRef.current = univer;
      setIsLoading(false);
    } catch (err) {
      console.error('Univer init error:', err);
      setError(`Failed to initialize: ${(err as Error).message}`);
      setIsLoading(false);
    }

    return () => {
      // Dispose Univer first, then remove the container from DOM
      if (univerRef.current) {
        univerRef.current.dispose();
        univerRef.current = null;
      }
      if (univerContainerRef.current && wrapperRef.current) {
        wrapperRef.current.removeChild(univerContainerRef.current);
        univerContainerRef.current = null;
      }
    };
  }, []); // empty deps — run exactly once

  useEffect(() => {
    if (!fileBlob || !univerRef.current || !wrapperRef.current) return;

    const loadExcel = async () => {
      try {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

        // Dispose and recreate Univer with the loaded data
        if (univerRef.current) {
          univerRef.current.dispose();
          univerRef.current = null;
        }

        // Reuse the existing manually-created container
        const container = univerContainerRef.current;
        if (!container) return;

        // Clear any leftover DOM from the previous instance
        container.innerHTML = '';

        const locale = Tools.deepMerge(
          {},
          DesignEnUS,
          UIEnUS,
          SheetsEnUS,
          SheetsFormulaEnUS,
          SheetsNumfmtEnUS
        );

        const univer = new Univer({
          locale: LocaleType.EN_US,
          locales: { [LocaleType.EN_US]: locale },
          theme: defaultTheme,
        });

        univer.registerPlugin(UniverRenderEnginePlugin);
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverUIPlugin, { container, header: true, toolbar: true, footer: true });
        univer.registerPlugin(UniverDocsPlugin, { hasScroll: false });
        univer.registerPlugin(UniverDocsUIPlugin);
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsUIPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsFormulaUIPlugin);
        univer.registerPlugin(UniverSheetsNumfmtPlugin);
        univer.registerPlugin(UniverSheetsNumfmtUIPlugin);

        // univer.createUnit(UniverInstanceType.UNIVER_SHEET, buildWorkbookData(jsonData));
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
          id: 'emb-workbook',
          locale: LocaleType.EN_US,
          name: 'MB Test',
          sheetOrder: ['mb-sheet', 'abstract-sheet'],
          sheets: {
            'mb-sheet': {
              id: 'mb-sheet',
              name: 'MB',
              rowCount: 20,
              columnCount: 10,
              cellData: {
                0: { 0: { v: 'Item', t: 1 }, 1: { v: 'Quantity', t: 1 } },
                1: { 0: { v: 'Earthwork', t: 1 }, 1: { v: 100, t: 2 } },
                2: { 0: { v: 'Concrete', t: 1 },  1: { v: 250, t: 2 } },
                3: { 0: { v: 'Brickwork', t: 1 }, 1: { v: 75, t: 2 } },
                4: { 0: { v: 'Total', t: 1 },     1: { f: '=SUM(B2:B4)', v: 425, t: 2 } },
              },
            },
            'abstract-sheet': {
              id: 'abstract-sheet',
              name: 'Abstract',
              rowCount: 20,
              columnCount: 10,
              cellData: {
                0: { 0: { v: 'Source', t: 1 },      1: { v: 'Value', t: 1 } },
                1: { 0: { v: 'MB Total Qty', t: 1 }, 1: { f: "='MB'!B5", v: 425, t: 2 } },
                2: { 0: { v: 'Rate (₹)', t: 1 },     1: { v: 1500, t: 2 } },
                3: { 0: { v: 'Amount (₹)', t: 1 },   1: { f: '=B2*B3', v: 637500, t: 2 } },
              },
            },
          },
        });
        univerRef.current = univer;
      } catch (err) {
        console.error('Excel load error:', err);
      }
    };

    loadExcel();
  }, [fileBlob]);

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '600px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', zIndex: 10 }}>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Loading editor…</span>
        </div>
      )}
      {/*
        This div is managed by React but intentionally has NO React children.
        Univer will appendChild its own container into it imperatively.
        React must never render children inside wrapperRef.
      */}
      <div ref={wrapperRef} style={{ height: '100%', width: '100%' }} />

      {/* readOnly overlay — sits above the Univer canvas */}
      {readOnly && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 20, cursor: 'not-allowed', background: 'transparent' }}
          title="This measurement book has been submitted and is read-only"
        />
      )}
    </div>
  );
}

export default UniverEditor;