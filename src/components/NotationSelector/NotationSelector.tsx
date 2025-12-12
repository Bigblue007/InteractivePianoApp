import { useNotationStore, NotationStandard } from '../../stores/useNotationStore';
import './NotationSelector.css';

export function NotationSelector() {
  const standard = useNotationStore((state) => state.standard);
  const setStandard = useNotationStore((state) => state.setStandard);

  return (
    <div className="notation-selector">
      <label htmlFor="notation-select">Notace:</label>
      <select
        id="notation-select"
        value={standard}
        onChange={(e) => setStandard(e.target.value as NotationStandard)}
        className="notation-select"
      >
        <option value="jazz">Jazz (C, Am)</option>
        <option value="classical">Klasická (CM, Am)</option>
      </select>
    </div>
  );
}




