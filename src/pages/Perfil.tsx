import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Vehiculo, MakeResult, ModelResult, WikiResult, WikiImage } from '../types';
import { useApp } from '../store';
import {
  YEARS, typeFromModel, matchBodyClass, TYPE_EMOJI, DEFAULT_EMOJI,
  fetchMakes, fetchModelsForMake, fetchMakeTypes,
  searchWikimedia, downloadAsDataUri, searchCache,
} from '../utils';

const ITEMS_PER_PAGE = 50;

export default function Perfil() {
  const navigate = useNavigate();
  const { setTamanoVehiculo, tamanoVehiculo, setCliente, cliente: storedCliente } = useApp();

  const [nombre, setNombre] = useState(storedCliente?.nombre ?? '');
  const [telefono, setTelefono] = useState(storedCliente?.telefono ?? '');
  const [personaRecoge, setPersonaRecoge] = useState(storedCliente?.personaRecoge ?? '');
  const [direccion, setDireccion] = useState(storedCliente?.direccion ?? '');
  const [notas, setNotas] = useState(storedCliente?.notas ?? '');
  const [vehiculo, setVehiculo] = useState<Vehiculo>(storedCliente?.vehiculo ?? { placa: '', marca: '', modelo: '', color: '' });

  const [makes, setMakes] = useState<MakeResult[]>([]);
  const [models, setModels] = useState<ModelResult[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [searching, setSearching] = useState(false);
  const [wikiResult, setWikiResult] = useState<WikiResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ dataUri: string; attribution: string } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadingImage, setLoadingImage] = useState(false);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showUploaded, setShowUploaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'marca' | 'modelo' | 'año'>('marca');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [makeTypes, setMakeTypes] = useState<string[]>([]);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [manualMarca, setManualMarca] = useState(false);
  const [manualModelo, setManualModelo] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storedCliente) {
      setNombre(storedCliente.nombre);
      setTelefono(storedCliente.telefono);
      setPersonaRecoge(storedCliente.personaRecoge ?? '');
      setDireccion(storedCliente.direccion ?? '');
      setNotas(storedCliente.notas ?? '');
      setVehiculo(storedCliente.vehiculo);
      if (storedCliente.vehiculo.anio) setSelectedYear(storedCliente.vehiculo.anio);
      if (storedCliente.vehiculo.imagenUri) {
        const uri = storedCliente.vehiculo.imagenUri;
        if (uri.startsWith('file:') || uri.startsWith('blob:') || uri.startsWith('data:image') === false) {
          setUploadedImage(uri);
          setShowUploaded(true);
        } else {
          setSelectedImage({ dataUri: uri, attribution: '' });
        }
      }
      if (storedCliente.vehiculo.tipoVehiculo) setVehicleType(storedCliente.vehiculo.tipoVehiculo);
    }
  }, [storedCliente]);

  useEffect(() => { setTamanoVehiculo(vehicleType); }, [vehicleType, setTamanoVehiculo]);

  useEffect(() => {
    if (makeTypes.length > 0 && vehiculo.marca && vehiculo.modelo && !vehicleType) {
      const detected = typeFromModel(vehiculo.marca, vehiculo.modelo, makeTypes);
      if (detected) setVehicleType(detected);
    }
  }, [makeTypes]);

  useEffect(() => {
    setLoadingMakes(true);
    fetchMakes().then(setMakes).catch(() => {}).finally(() => setLoadingMakes(false));
  }, []);

  const loadModels = useCallback((makeId: number, year: string | null) => {
    setLoadingModels(true);
    setModalMode('modelo');
    setSearch('');
    setPage(1);
    fetchModelsForMake(makeId, year).then(setModels).catch(() => {}).finally(() => setLoadingModels(false));
  }, []);

  const downloadAndShow = useCallback(async (imgs: WikiImage[], idx: number) => {
    const img = imgs[idx];
    if (!img) return;
    setCurrentIdx(idx);
    setImageLoadFailed(false);
    if (img.dataUri) {
      setSelectedImage({ dataUri: img.dataUri, attribution: img.atribucion });
      return;
    }
    setLoadingImage(true);
    try {
      const dataUri = await downloadAsDataUri(img.url);
      img.dataUri = dataUri;
      setSelectedImage({ dataUri, attribution: img.atribucion });
    } catch {
      setImageLoadFailed(true);
    }
    setLoadingImage(false);
  }, []);

  const fetchImages = useCallback(async (make: string, model: string, year: string | null) => {
    const key = `${year ?? ''}|${make}|${model}`.toLowerCase();
    const cached = searchCache.get(key);
    if (cached) { setWikiResult(cached); await downloadAndShow(cached.imagenes, 0); return; }
    setSearching(true);
    setImageLoadFailed(false);
    const res = await searchWikimedia(make, model, year);
    searchCache.set(key, res);
    setWikiResult(res);
    setSearching(false);
    if (res.exito && res.imagenes.length > 0) await downloadAndShow(res.imagenes, 0);
  }, [downloadAndShow]);

  const triggerSearch = useCallback((make: string, model: string, year: string | null) => {
    if (!make || !model) { setWikiResult(null); setSelectedImage(null); setVehicleType(null); return; }
    setVehicleType(typeFromModel(make, model, makeTypes));
    setSelectedImage(null);
    setCurrentIdx(0);
    fetchImages(make, model, year);
  }, [fetchImages, makeTypes]);

  const handlePickImage = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setShowUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const removeUploaded = () => {
    setShowUploaded(false);
    setUploadedImage(null);
  };

  const goNext = () => {
    if (!wikiResult?.exito) return;
    const next = (currentIdx + 1) % wikiResult.imagenes.length;
    downloadAndShow(wikiResult.imagenes, next);
  };

  const goPrev = () => {
    if (!wikiResult?.exito) return;
    const prev = (currentIdx - 1 + wikiResult.imagenes.length) % wikiResult.imagenes.length;
    downloadAndShow(wikiResult.imagenes, prev);
  };

  const openModal = (mode: 'marca' | 'modelo' | 'año') => {
    if (mode === 'modelo' && !selectedMakeId) return;
    setSearch('');
    setPage(1);
    setModalMode(mode);
    setModalVisible(true);
    if (mode === 'modelo') loadModels(selectedMakeId!, selectedYear);
  };

  const selectMake = (m: MakeResult) => {
    setVehiculo((prev) => ({ ...prev, marca: m.Make_Name, modelo: '' }));
    setSelectedMakeId(m.Make_ID);
    setMakeTypes([]);
    setSelectedImage(null); setWikiResult(null); setVehicleType(null);
    loadModels(m.Make_ID, selectedYear);
    fetchMakeTypes(m.Make_Name).then(setMakeTypes).catch(() => {});
    setModalVisible(false);
  };

  const selectYear = (year: string) => {
    setSelectedYear(year);
    if (selectedMakeId) loadModels(selectedMakeId, year);
    setModalVisible(false);
  };

  const selectModel = (m: ModelResult) => {
    setVehiculo((prev) => ({ ...prev, modelo: m.Model_Name }));
    setModalVisible(false);
    triggerSearch(vehiculo.marca, m.Model_Name, selectedYear);
  };

  const setMakeManually = (text: string) => {
    setVehiculo((prev) => ({ ...prev, marca: text }));
    setSelectedMakeId(null);
    setModels([]);
    setMakeTypes([]);
    setSelectedImage(null); setWikiResult(null); setVehicleType(null);
    setManualMarca(false);
    fetchMakeTypes(text).then(setMakeTypes).catch(() => {});
  };

  const setModelManually = (make: string, text: string) => {
    setVehiculo((prev) => ({ ...prev, modelo: text }));
    setManualModelo(false);
    triggerSearch(make, text, selectedYear);
  };

  const filteredItems = useMemo(() => {
    const items = modalMode === 'marca' ? makes : modalMode === 'año' ? YEARS : models;
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => {
      if (typeof i === 'string') return i.includes(q);
      return (i as MakeResult).Make_Name?.toLowerCase().includes(q);
    });
  }, [search, makes, models, modalMode]);

  const paginated = useMemo(() => filteredItems.slice(0, page * ITEMS_PER_PAGE), [filteredItems, page]);

  const emoji = vehicleType ? TYPE_EMOJI[matchBodyClass(vehicleType)] || DEFAULT_EMOJI : DEFAULT_EMOJI;

  const handleSave = () => {
    const vehiculoActualizado: Vehiculo = {
      ...vehiculo,
      anio: selectedYear ?? undefined,
      imagenUri: showUploaded && uploadedImage ? uploadedImage : selectedImage?.dataUri ?? undefined,
      tipoVehiculo: vehicleType ?? undefined,
    };
    setCliente({ nombre, telefono, vehiculo: vehiculoActualizado, personaRecoge, direccion, notas });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <h1 className="page-title">Perfil</h1>

      <div className="card">
        <div className="card-label">Datos personales</div>
        <div className="input-group">
          <label className="input-label">Nombre completo</label>
          <input className="input-field" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Número de contacto</label>
          <input className="input-field" placeholder="Teléfono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Persona que puede recoger el vehículo</label>
          <input className="input-field" placeholder="Nombre (opcional)" value={personaRecoge} onChange={(e) => setPersonaRecoge(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Dirección</label>
          <input className="input-field" placeholder="Dirección (opcional)" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Notas</label>
          <textarea className="input-field" placeholder="Notas o preferencias (opcional)" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} />
        </div>
      </div>

      <div className="card">
        <div className="card-label">Vehículo</div>

        <div className="image-container">
          {showUploaded && uploadedImage ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <img src={uploadedImage} alt="Vehículo" className="vehicle-image" />
              <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Foto subida por ti</p>
            </div>
          ) : searching || loadingImage ? (
            <p style={{ color: 'var(--gray)' }}>Cargando imagen...</p>
          ) : selectedImage && !imageLoadFailed ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <img src={selectedImage.dataUri} alt="Vehículo" className="vehicle-image" />
              <p className="image-attribution">{selectedImage.attribution}</p>
            </div>
          ) : (
            <div className="vehicle-emoji">{emoji}</div>
          )}
          {imageLoadFailed && (
            <p style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
              No se pudo cargar la imagen. {vehicleType && `Tipo: ${vehicleType}`}
            </p>
          )}
        </div>

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

        {showUploaded && uploadedImage ? (
          <button className="upload-btn" onClick={removeUploaded}>Usar foto de Wikimedia</button>
        ) : (
          <button className="upload-btn" onClick={handlePickImage}>Subir mi propia foto</button>
        )}

        {wikiResult && wikiResult.exito && wikiResult.total > 1 && (
          <div className="nav-row">
            <button className="nav-btn" onClick={goPrev}>◀ Anterior</button>
            <span className="nav-count">{currentIdx + 1} / {wikiResult.total}</span>
            <button className="nav-btn" onClick={goNext}>Siguiente ▶</button>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Placa</label>
          <input className="input-field" placeholder="ABC-1234" value={vehiculo.placa} onChange={(e) => setVehiculo((p) => ({ ...p, placa: e.target.value }))} />
        </div>

        {vehiculo.marca && vehiculo.modelo && (
          <div className="resumen-card">
            <div className="resumen-row">
              <span className="resumen-label">Tipo</span>
              <span className="resumen-value">{vehicleType || 'No detectado'}</span>
              {vehicleType && (
                <span className={`size-badge ${tamanoVehiculo === 'chico' ? 'size-chico' : tamanoVehiculo === 'moto' ? 'size-moto' : tamanoVehiculo === 'mediano' ? 'size-mediano' : tamanoVehiculo === 'trailer' ? 'size-trailer' : 'size-grande'}`}>
                  {tamanoVehiculo === 'moto' ? '🏍️ Moto' : tamanoVehiculo === 'trailer' ? '🚛 Trailer' : tamanoVehiculo === 'chico' ? 'S — Chico' : tamanoVehiculo === 'mediano' ? 'M — Mediano' : 'L — Grande'}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Marca</label>
          {manualMarca ? (
            <div className="manual-row">
              <input className="input-field" placeholder="Escribe la marca" value={vehiculo.marca} onChange={(e) => setVehiculo((p) => ({ ...p, marca: e.target.value }))} autoFocus />
              <button className="manual-confirm" onClick={() => setMakeManually(vehiculo.marca)}>OK</button>
              <button className="manual-cancel" onClick={() => { setManualMarca(false); setVehiculo((p) => ({ ...p, marca: '' })); }}>Cancelar</button>
            </div>
          ) : (
            <div className="picker-field" onClick={() => openModal('marca')}>
              <span className={`picker-text ${!vehiculo.marca ? 'placeholder' : ''}`}>{vehiculo.marca || 'Selecciona una marca'}</span>
              <span className="picker-arrow">▼</span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Año</label>
          <div className="picker-field" onClick={() => openModal('año')}>
            <span className={`picker-text ${!selectedYear ? 'placeholder' : ''}`}>{selectedYear || 'Selecciona un año (opcional)'}</span>
            <span className="picker-arrow">▼</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Modelo</label>
          {manualModelo || (vehiculo.marca && !selectedMakeId) ? (
            <div className="manual-row">
              <input className="input-field" placeholder="Escribe el modelo" value={vehiculo.modelo} onChange={(e) => setVehiculo((p) => ({ ...p, modelo: e.target.value }))} autoFocus />
              <button className="manual-confirm" onClick={() => setModelManually(vehiculo.marca, vehiculo.modelo)}>OK</button>
              <button className="manual-cancel" onClick={() => { setManualModelo(false); setVehiculo((p) => ({ ...p, modelo: '' })); }}>Cancelar</button>
            </div>
          ) : (
            <div className={`picker-field ${!selectedMakeId ? 'disabled' : ''}`} onClick={() => selectedMakeId && openModal('modelo')}>
              <span className={`picker-text ${!vehiculo.modelo ? 'placeholder' : ''}`}>
                {vehiculo.modelo || (selectedMakeId ? 'Selecciona un modelo' : 'Primero elige una marca')}
              </span>
              <span className="picker-arrow">▼</span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Color</label>
          <input className="input-field" placeholder="Color del vehículo" value={vehiculo.color} onChange={(e) => setVehiculo((p) => ({ ...p, color: e.target.value }))} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          {saved ? '✓ Guardado' : 'Guardar datos'}
        </button>
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'marca' ? 'Seleccionar marca' : modalMode === 'año' ? 'Seleccionar año' : 'Seleccionar modelo'}
              </h3>
              <button className="modal-close" onClick={() => setModalVisible(false)}>Cerrar</button>
            </div>
            {modalMode !== 'año' && (
              <input className="modal-search" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
            )}
            {loadingModels && modalMode === 'modelo' ? (
              <p style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>Cargando...</p>
            ) : (
              <div>
                {paginated.length === 0 && <p className="empty-title" style={{ padding: 20 }}>Sin resultados</p>}
                {modalMode === 'año'
                  ? (paginated as string[]).map((year) => (
                      <div className="modal-item" key={year} onClick={() => selectYear(year)}>
                        <span className="modal-item-text">{year}</span>
                      </div>
                    ))
                  : (paginated as (MakeResult | ModelResult)[]).map((item) => {
                      const name = modalMode === 'marca' ? (item as MakeResult).Make_Name : (item as ModelResult).Model_Name;
                      const key = modalMode === 'marca' ? `mk-${(item as MakeResult).Make_ID}` : `md-${(item as ModelResult).Model_ID}`;
                      return (
                        <div className="modal-item" key={key} onClick={() => modalMode === 'marca' ? selectMake(item as MakeResult) : selectModel(item as ModelResult)}>
                          <span className="modal-item-text">{name}</span>
                        </div>
                      );
                    })
                }
                {paginated.length < filteredItems.length && (
                  <div className="modal-item" style={{ textAlign: 'center' }} onClick={() => setPage((p) => p + 1)}>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>Cargar más...</span>
                  </div>
                )}
                {modalMode !== 'año' && (
                  <div className="modal-manual-option" onClick={() => { setModalVisible(false); modalMode === 'marca' ? setManualMarca(true) : setManualModelo(true); }}>
                    ✏️ No encuentro lo que busco — Escribir manualmente
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
