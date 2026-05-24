import React, { useState, useEffect } from 'react';
import { SampleLibraryManager } from '../../services/sampleLibrary/SampleLibraryManager';
import { OFFICIAL_SAMPLE_PACKS, SamplePack } from '../../services/sampleLibrary/SamplePackRegistry';
import './SampleManager.css';

interface DownloadingState {
  [key: string]: number; // packId -> progress
}

export const SampleManager: React.FC = () => {
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<DownloadingState>({});
  const [error, setError] = useState<string | null>(null);
  const manager = SampleLibraryManager.getInstance();

  useEffect(() => {
    refreshInstalledList();
  }, []);

  const refreshInstalledList = async () => {
    const list = await manager.scanInstalledPacks();
    setInstalledPacks(list);
  };

  const handleInstall = async (packId: string) => {
    setError(null);
    try {
      setDownloading(prev => ({ ...prev, [packId]: 0 }));
      await manager.downloadAndInstallPack(packId, (progress) => {
        setDownloading(prev => ({ ...prev, [packId]: progress }));
      });
      setDownloading(prev => {
        const copy = { ...prev };
        delete copy[packId];
        return copy;
      });
      await refreshInstalledList();
    } catch (err: any) {
      setError(`Instalace selhala: ${err.message || err}`);
      setDownloading(prev => {
        const copy = { ...prev };
        delete copy[packId];
        return copy;
      });
    }
  };

  const handleUninstall = async (packId: string) => {
    setError(null);
    try {
      if (confirm('Opravdu chcete tento balíček samplů smazat?')) {
        await manager.uninstallPack(packId);
        await refreshInstalledList();
      }
    } catch (err: any) {
      setError(`Odinstalace selhala: ${err.message || err}`);
    }
  };

  if (!manager.isElectron()) {
    return (
      <div className="sample-manager-web-banner">
        <h3>🎹 Rozšířené zvukové knihovny</h3>
        <p>
          V plné verzi **Harmonia Desktop** získáte přístup k velkým akustickým sample setům (např. Salamander Grand Piano) 
          a přímému čtení z disku bez latence prohlížeče.
        </p>
        <div className="download-desktop-badge">Dostupné v desktopové verzi</div>
      </div>
    );
  }

  return (
    <div className="sample-manager-container">
      <div className="sample-manager-header">
        <h2>🎹 Správce zvukových knihoven</h2>
        <p className="subtitle">Přizpůsobte si zvuk klavíru stažením doplňujících samplů přímo do aplikace</p>
      </div>

      {error && <div className="sample-manager-error">{error}</div>}

      <div className="sample-packs-grid">
        {OFFICIAL_SAMPLE_PACKS.map((pack) => {
          const isInstalled = installedPacks.includes(pack.id);
          const isDownloading = pack.id in downloading;
          const progress = downloading[pack.id] || 0;

          return (
            <div key={pack.id} className={`pack-card ${isInstalled ? 'installed' : ''}`}>
              <div className="pack-card-glow"></div>
              <div className="pack-info">
                <h3>{pack.name}</h3>
                <span className="pack-size">{pack.size}</span>
                <p className="pack-description">{pack.description}</p>
              </div>

              <div className="pack-actions">
                {isInstalled ? (
                  <div className="status-installed-group">
                    <span className="badge-installed">Nainstalováno</span>
                    <button className="btn-uninstall" onClick={() => handleUninstall(pack.id)}>
                      Odstranit
                    </button>
                  </div>
                ) : isDownloading ? (
                  <div className="download-progress-container">
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">Stahuje se... {Math.floor(progress)}%</span>
                  </div>
                ) : (
                  <button className="btn-install" onClick={() => handleInstall(pack.id)}>
                    Stáhnout a aktivovat
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
