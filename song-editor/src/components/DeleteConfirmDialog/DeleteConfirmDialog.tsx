import React from 'react';
import './DeleteConfirmDialog.css';

interface DeleteConfirmDialogProps {
  songTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  songTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div className="delete-dialog-overlay" onClick={onCancel}>
      <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Smazat píseň?</h3>
        <p>
          Opravdu chcete smazat píseň <strong>"{songTitle}"</strong>?
        </p>
        <p className="warning">Tato akce je nevratná.</p>
        <div className="dialog-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Zrušit
          </button>
          <button type="button" onClick={onConfirm} className="confirm-btn">
            Smazat
          </button>
        </div>
      </div>
    </div>
  );
}

