import { OFFICIAL_SAMPLE_PACKS } from './SamplePackRegistry';

/**
 * Třída pro správu sample knihoven v desktopové verzi
 */
export class SampleLibraryManager {
  private static instance: SampleLibraryManager | null = null;
  private installedPacks: Set<string> = new Set();
  private isScanning: boolean = false;

  private constructor() {
    this.scanInstalledPacks();
  }

  /**
   * Získá instanci SampleLibraryManager (singleton)
   */
  static getInstance(): SampleLibraryManager {
    if (!SampleLibraryManager.instance) {
      SampleLibraryManager.instance = new SampleLibraryManager();
    }
    return SampleLibraryManager.instance;
  }

  /**
   * Zkontroluje, zda běží v Electronu
   */
  isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  /**
   * Zjistí, zda je sample pack nainstalován
   */
  async isPackInstalled(packId: string): Promise<boolean> {
    if (!this.isElectron()) {
      return false;
    }
    
    // Pokud je už v paměťové cache
    if (this.installedPacks.has(packId)) {
      return true;
    }

    try {
      const appDataPath = await window.electronAPI!.getAppDataPath();
      // Relativní cesta k packu v appData
      const packDir = `samples/${packId}`;
      const fullPath = `${appDataPath}/${packDir}`;
      
      // Pokusit se vypsat soubory ve složce
      const files = await window.electronAPI!.listSampleFiles(fullPath);
      
      if (files && files.length > 0) {
        this.installedPacks.add(packId);
        return true;
      }
      return false;
    } catch (e) {
      // Složka neexistuje nebo nejde přečíst
      return false;
    }
  }

  /**
   * Proskenuje všechny nainstalované balíčky
   */
  async scanInstalledPacks(): Promise<string[]> {
    if (!this.isElectron() || this.isScanning) {
      return Array.from(this.installedPacks);
    }

    this.isScanning = true;
    try {
      this.installedPacks.clear();
      
      // Projít všechny oficiální balíčky a ověřit instalaci
      for (const pack of OFFICIAL_SAMPLE_PACKS) {
        const installed = await this.isPackInstalled(pack.id);
        if (installed) {
          this.installedPacks.add(pack.id);
        }
      }
    } catch (error) {
      console.error('Chyba při skenování nainstalovaných balíčků:', error);
    } finally {
      this.isScanning = false;
    }

    return Array.from(this.installedPacks);
  }

  /**
   * Simuluje/provádí stahování sample packu
   */
  async downloadAndInstallPack(
    packId: string,
    onProgress: (progress: number) => void
  ): Promise<void> {
    if (!this.isElectron()) {
      throw new Error('Stahování samplů je dostupné pouze v desktopové verzi.');
    }

    const pack = OFFICIAL_SAMPLE_PACKS.find(p => p.id === packId);
    if (!pack) {
      throw new Error(`Balíček s ID ${packId} nebyl nalezen.`);
    }

    // Začít stahování (simulace s postupným progress-barem pro MVP)
    // V plné verzi by se stahoval ZIP z `pack.downloadUrl` a rozbaloval se do AppData/samples/packId
    return new Promise<void>((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 5 + Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          onProgress(progress);
          clearInterval(interval);
          
          try {
            // Označit jako nainstalované
            this.installedPacks.add(packId);
            
            // Poznámka: Zde bychom v reálné produkci uložili metadata o stažení do JSON souboru na disk
            console.log(`Balíček ${pack.name} byl úspěšně nainstalován.`);
            resolve();
          } catch (e) {
            reject(e);
          }
        } else {
          onProgress(Math.floor(progress));
        }
      }, 300);
    });
  }

  /**
   * Odstraní nainstalovaný balíček z disku
   */
  async uninstallPack(packId: string): Promise<void> {
    if (!this.isElectron()) {
      return;
    }

    try {
      // V produkci bychom smazali složku v AppData přes IPC handler (např. fs.rm)
      // Pro MVP smažeme pouze z cache v paměti
      this.installedPacks.delete(packId);
      console.log(`Balíček ${packId} byl odinstalován.`);
    } catch (error) {
      console.error(`Chyba při odstraňování balíčku ${packId}:`, error);
      throw error;
    }
  }
}
