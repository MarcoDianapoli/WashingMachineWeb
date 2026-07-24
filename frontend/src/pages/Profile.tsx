import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Vehicle, MakeResult, ModelResult, WikiResult, WikiImage } from '../types';
import { useApp } from '../store';
import {
  YEARS, typeFromModel, matchBodyClass, TYPE_EMOJI, DEFAULT_EMOJI,
  fetchMakes, fetchModelsForMake, fetchMakeTypes,
  searchWikimedia, downloadAsDataUri, searchCache,
} from '../utils';

const ITEMS_PER_PAGE = 50;

type ModalMode = 'make' | 'model' | 'year';

export default function Profile() {
  const { setVehicleType: setStoreVehicleType, vehicleSize, setCustomer, customer: storedCustomer } = useApp();

  const [name, setName] = useState(storedCustomer?.name ?? '');
  const [phone, setPhone] = useState(storedCustomer?.phone ?? '');
  const [pickupPerson, setPickupPerson] = useState(storedCustomer?.pickupPerson ?? '');
  const [address, setAddress] = useState(storedCustomer?.address ?? '');
  const [notes, setNotes] = useState(storedCustomer?.notes ?? '');
  const [vehicle, setVehicle] = useState<Vehicle>(storedCustomer?.vehicle ?? { plate: '', make: '', model: '', color: '' });

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
  const [modalMode, setModalMode] = useState<ModalMode>('make');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [makeTypes, setMakeTypes] = useState<string[]>([]);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [manualMake, setManualMake] = useState(false);
  const [manualModel, setManualModel] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storedCustomer) {
      setName(storedCustomer.name);
      setPhone(storedCustomer.phone);
      setPickupPerson(storedCustomer.pickupPerson ?? '');
      setAddress(storedCustomer.address ?? '');
      setNotes(storedCustomer.notes ?? '');
      setVehicle(storedCustomer.vehicle);
      if (storedCustomer.vehicle.year) setSelectedYear(storedCustomer.vehicle.year);
      if (storedCustomer.vehicle.imageUri) {
        const uri = storedCustomer.vehicle.imageUri;
        if (uri.startsWith('file:') || uri.startsWith('blob:') || uri.startsWith('data:image') === false) {
          setUploadedImage(uri);
          setShowUploaded(true);
        } else {
          setSelectedImage({ dataUri: uri, attribution: '' });
        }
      }
      if (storedCustomer.vehicle.vehicleType) setVehicleType(storedCustomer.vehicle.vehicleType);
    }
  }, [storedCustomer]);

  useEffect(() => { setStoreVehicleType(vehicleType); }, [vehicleType, setStoreVehicleType]);

  useEffect(() => {
    if (makeTypes.length > 0 && vehicle.make && vehicle.model && !vehicleType) {
      const detected = typeFromModel(vehicle.make, vehicle.model, makeTypes);
      if (detected) setVehicleType(detected);
    }
  }, [makeTypes]);

  useEffect(() => {
    setLoadingMakes(true);
    fetchMakes().then(setMakes).catch(() => {}).finally(() => setLoadingMakes(false));
  }, []);

  const loadModels = useCallback((makeId: number, year: string | null) => {
    setLoadingModels(true);
    setModalMode('model');
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
      setSelectedImage({ dataUri: img.dataUri, attribution: img.attribution });
      return;
    }
    setLoadingImage(true);
    try {
      const dataUri = await downloadAsDataUri(img.url);
      img.dataUri = dataUri;
      setSelectedImage({ dataUri, attribution: img.attribution });
    } catch {
      setImageLoadFailed(true);
    }
    setLoadingImage(false);
  }, []);

  const fetchImages = useCallback(async (make: string, model: string, year: string | null) => {
    const key = `${year ?? ''}|${make}|${model}`.toLowerCase();
    const cached = searchCache.get(key);
    if (cached) { setWikiResult(cached); await downloadAndShow(cached.images, 0); return; }
    setSearching(true);
    setImageLoadFailed(false);
    const res = await searchWikimedia(make, model, year);
    searchCache.set(key, res);
    setWikiResult(res);
    setSearching(false);
    if (res.success && res.images.length > 0) await downloadAndShow(res.images, 0);
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
    if (!wikiResult?.success) return;
    const next = (currentIdx + 1) % wikiResult.images.length;
    downloadAndShow(wikiResult.images, next);
  };

  const goPrev = () => {
    if (!wikiResult?.success) return;
    const prev = (currentIdx - 1 + wikiResult.images.length) % wikiResult.images.length;
    downloadAndShow(wikiResult.images, prev);
  };

  const openModal = (mode: ModalMode) => {
    if (mode === 'model' && !selectedMakeId) return;
    setSearch('');
    setPage(1);
    setModalMode(mode);
    setModalVisible(true);
    if (mode === 'model') loadModels(selectedMakeId!, selectedYear);
  };

  const selectMake = (m: MakeResult) => {
    setVehicle((prev) => ({ ...prev, make: m.Make_Name, model: '' }));
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
    setVehicle((prev) => ({ ...prev, model: m.Model_Name }));
    setModalVisible(false);
    triggerSearch(vehicle.make, m.Model_Name, selectedYear);
  };

  const setMakeManually = (text: string) => {
    setVehicle((prev) => ({ ...prev, make: text }));
    setSelectedMakeId(null);
    setModels([]);
    setMakeTypes([]);
    setSelectedImage(null); setWikiResult(null); setVehicleType(null);
    setManualMake(false);
    fetchMakeTypes(text).then(setMakeTypes).catch(() => {});
  };

  const setModelManually = (make: string, text: string) => {
    setVehicle((prev) => ({ ...prev, model: text }));
    setManualModel(false);
    triggerSearch(make, text, selectedYear);
  };

  const filteredItems = useMemo(() => {
    const items = modalMode === 'make' ? makes : modalMode === 'year' ? YEARS : models;
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
    const updatedVehicle: Vehicle = {
      ...vehicle,
      year: selectedYear ?? undefined,
      imageUri: showUploaded && uploadedImage ? uploadedImage : selectedImage?.dataUri ?? undefined,
      vehicleType: vehicleType ?? undefined,
    };
    setCustomer({ name, phone, vehicle: updatedVehicle, pickupPerson, address, notes });
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
          <input className="input-field" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Número de contacto</label>
          <input className="input-field" placeholder="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Persona que puede recoger el vehículo</label>
          <input className="input-field" placeholder="Nombre (opcional)" value={pickupPerson} onChange={(e) => setPickupPerson(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Dirección</label>
          <input className="input-field" placeholder="Dirección (opcional)" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Notas</label>
          <textarea className="input-field" placeholder="Notas o preferencias (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
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

        {wikiResult && wikiResult.success && wikiResult.total > 1 && (
          <div className="nav-row">
            <button className="nav-btn" onClick={goPrev}>◀ Anterior</button>
            <span className="nav-count">{currentIdx + 1} / {wikiResult.total}</span>
            <button className="nav-btn" onClick={goNext}>Siguiente ▶</button>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Placa</label>
          <input className="input-field" placeholder="ABC-1234" value={vehicle.plate} onChange={(e) => setVehicle((p) => ({ ...p, plate: e.target.value }))} />
        </div>

        {vehicle.make && vehicle.model && (
          <div className="summary-card">
            <div className="summary-row">
              <span className="summary-label">Tipo</span>
              <span className="summary-value">{vehicleType || 'No detectado'}</span>
              {vehicleType && (
                <span className={`size-badge ${vehicleSize === 'small' ? 'size-small' : vehicleSize === 'motorcycle' ? 'size-motorcycle' : vehicleSize === 'medium' ? 'size-medium' : vehicleSize === 'trailer' ? 'size-trailer' : 'size-large'}`}>
                  {vehicleSize === 'motorcycle' ? '🏍️ Moto' : vehicleSize === 'trailer' ? '🚛 Trailer' : vehicleSize === 'small' ? 'S — Chico' : vehicleSize === 'medium' ? 'M — Mediano' : 'L — Grande'}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Marca</label>
          {manualMake ? (
            <div className="manual-row">
              <input className="input-field" placeholder="Escribe la marca" value={vehicle.make} onChange={(e) => setVehicle((p) => ({ ...p, make: e.target.value }))} autoFocus />
              <button className="manual-confirm" onClick={() => setMakeManually(vehicle.make)}>OK</button>
              <button className="manual-cancel" onClick={() => { setManualMake(false); setVehicle((p) => ({ ...p, make: '' })); }}>Cancelar</button>
            </div>
          ) : (
            <div className="picker-field" onClick={() => openModal('make')}>
              <span className={`picker-text ${!vehicle.make ? 'placeholder' : ''}`}>{vehicle.make || 'Selecciona una marca'}</span>
              <span className="picker-arrow">▼</span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Año</label>
          <div className="picker-field" onClick={() => openModal('year')}>
            <span className={`picker-text ${!selectedYear ? 'placeholder' : ''}`}>{selectedYear || 'Selecciona un año (opcional)'}</span>
            <span className="picker-arrow">▼</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Modelo</label>
          {manualModel || (vehicle.make && !selectedMakeId) ? (
            <div className="manual-row">
              <input className="input-field" placeholder="Escribe el modelo" value={vehicle.model} onChange={(e) => setVehicle((p) => ({ ...p, model: e.target.value }))} autoFocus />
              <button className="manual-confirm" onClick={() => setModelManually(vehicle.make, vehicle.model)}>OK</button>
              <button className="manual-cancel" onClick={() => { setManualModel(false); setVehicle((p) => ({ ...p, model: '' })); }}>Cancelar</button>
            </div>
          ) : (
            <div className={`picker-field ${!selectedMakeId ? 'disabled' : ''}`} onClick={() => selectedMakeId && openModal('model')}>
              <span className={`picker-text ${!vehicle.model ? 'placeholder' : ''}`}>
                {vehicle.model || (selectedMakeId ? 'Selecciona un modelo' : 'Primero elige una marca')}
              </span>
              <span className="picker-arrow">▼</span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Color</label>
          <input className="input-field" placeholder="Color del vehículo" value={vehicle.color} onChange={(e) => setVehicle((p) => ({ ...p, color: e.target.value }))} />
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
                {modalMode === 'make' ? 'Seleccionar marca' : modalMode === 'year' ? 'Seleccionar año' : 'Seleccionar modelo'}
              </h3>
              <button className="modal-close" onClick={() => setModalVisible(false)}>Cerrar</button>
            </div>
            {modalMode !== 'year' && (
              <input className="modal-search" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
            )}
            {loadingModels && modalMode === 'model' ? (
              <p style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>Cargando...</p>
            ) : (
              <div>
                {paginated.length === 0 && <p className="empty-title" style={{ padding: 20 }}>Sin resultados</p>}
                {modalMode === 'year'
                  ? (paginated as string[]).map((year) => (
                      <div className="modal-item" key={year} onClick={() => selectYear(year)}>
                        <span className="modal-item-text">{year}</span>
                      </div>
                    ))
                  : (paginated as (MakeResult | ModelResult)[]).map((item) => {
                      const itemName = modalMode === 'make' ? (item as MakeResult).Make_Name : (item as ModelResult).Model_Name;
                      const key = modalMode === 'make' ? `mk-${(item as MakeResult).Make_ID}` : `md-${(item as ModelResult).Model_ID}`;
                      return (
                        <div className="modal-item" key={key} onClick={() => modalMode === 'make' ? selectMake(item as MakeResult) : selectModel(item as ModelResult)}>
                          <span className="modal-item-text">{itemName}</span>
                        </div>
                      );
                    })
                }
                {paginated.length < filteredItems.length && (
                  <div className="modal-item" style={{ textAlign: 'center' }} onClick={() => setPage((p) => p + 1)}>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>Cargar más...</span>
                  </div>
                )}
                {modalMode !== 'year' && (
                  <div className="modal-manual-option" onClick={() => { setModalVisible(false); modalMode === 'make' ? setManualMake(true) : setManualModel(true); }}>
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
