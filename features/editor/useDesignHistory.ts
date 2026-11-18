"use client";
/**
 * File ini untuk apa:
 * Hook `useDesignHistory`: menyimpan desain beserta riwayat perubahan sehingga
 * undo/redo bisa dilakukan (minimal 20 langkah, PRD §8.3).
 * Cara kerja: `past` = keadaan sebelumnya, `present` = sekarang, `future` = untuk redo.
 */
import { useCallback, useState } from "react";
import type { DesignState } from "./types";

const MAX_HISTORY = 50;

interface History {
  past: DesignState[];
  present: DesignState;
  future: DesignState[];
}

/** `initial` boleh berupa desain atau fungsi pembuat desain (dijalankan sekali saja). */
export function useDesignHistory(initial: DesignState | (() => DesignState)) {
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: typeof initial === "function" ? initial() : initial,
    future: [],
  }));

  /** Mengubah desain: keadaan lama masuk ke riwayat, redo dikosongkan. */
  const update = useCallback((change: (design: DesignState) => DesignState) => {
    setHistory((current) => ({
      past: [...current.past, current.present].slice(-MAX_HISTORY),
      present: change(current.present),
      future: [],
    }));
  }, []);

  /** Mengganti desain tanpa mencatat riwayat (dipakai saat memulihkan draf). */
  const replace = useCallback((design: DesignState) => {
    setHistory({ past: [], present: design, future: [] });
  }, []);

  /** Kembali satu langkah. */
  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      return { past: current.past.slice(0, -1), present: previous, future: [current.present, ...current.future] };
    });
  }, []);

  /** Maju satu langkah (membatalkan undo). */
  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;
      const [next, ...rest] = current.future;
      return { past: [...current.past, current.present], present: next, future: rest };
    });
  }, []);

  return {
    design: history.present,
    update,
    replace,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
