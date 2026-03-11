import React, { useState, useRef, useEffect } from 'react';
import { domToBlob, domToCanvas } from 'modern-screenshot';
import { Download, Loader2 } from 'lucide-react';
import ProfileCard from './ProfileCard';
import './App.css';

function App() {
  const [profileData, setProfileData] = useState({
    name: '',
    twitterName: '',
    joinDate: '',
    server: '',
    playStyle: '',
    favoriteChars: '',
    animeHistory: [],
    difficulty: '',
    realEvents: '',
    otherGames: '',
    freeSpace: '',
    image: null,
    bgImage: null,
    bgPositionX: 0,
    bgPositionY: 0,
    bgScale: 100
  });

  const [isExporting, setIsExporting] = useState(false);
  const [defaultBgUrl, setDefaultBgUrl] = useState('');
  const bgImageInputRef = useRef(null);
  const lastExportAtRef = useRef(0);

  useEffect(() => {
    const isMobile =
      window.innerWidth <= 768 || /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);

    const bgFilename = isMobile ? 'bg2_small.jpg' : 'bg2.png';
    setDefaultBgUrl(`${import.meta.env.BASE_URL}${bgFilename}`);
  }, []);

  useEffect(() => {
    return () => {
      if (profileData.image && profileData.image.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.image);
      }
      if (profileData.bgImage && profileData.bgImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.bgImage);
      }
    };
  }, [profileData.image, profileData.bgImage]);

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height && width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context の取得に失敗しました。'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const isTransparentFormat = ['image/png', 'image/gif', 'image/webp'].includes(file.type);
          const outputMimeType = isTransparentFormat ? 'image/png' : 'image/jpeg';

          const dataUrl = canvas.toDataURL(
            outputMimeType,
            isTransparentFormat ? undefined : 0.9
          );
          resolve(dataUrl);
        };

        img.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました。'));
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const serverName = [
    '横須賀鎮守府', '呉鎮守府', '佐世保鎮守府', '舞鶴鎮守府', '大湊警備府',
    'トラック泊地', 'リンガ泊地', 'ラバウル基地', 'ショートランド泊地', 'ブイン基地',
    'タウイタウイ泊地', 'パラオ泊地', 'ブルネイ泊地', '単冠湾泊地', '幌筵泊地',
    '宿毛湾泊地', '鹿屋基地', '岩川基地', '佐伯湾泊地', '柱島泊地'
  ];

  const PulldownMenu = () => (
    <select name="server" value={profileData.server} onChange={handleChange}>
      <option value="">未選択</option>
      {serverName.map((server) => (
        <option key={server} value={server}>{server}</option>
      ))}
    </select>
  );

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setProfileData((prev) => {
      const currentArray = prev[name] || [];
      return checked
        ? { ...prev, [name]: [...currentArray, value] }
        : { ...prev, [name]: currentArray.filter((item) => item !== value) };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedUrl = await resizeImage(file, 800, 800);
      setProfileData((prev) => {
        if (prev.image && prev.image.startsWith('blob:')) {
          URL.revokeObjectURL(prev.image);
        }
        return { ...prev, image: resizedUrl };
      });
    } catch (err) {
      console.error(err);
      alert('アイコン画像の読み込みに失敗しました。');
    }
  };

  const handleBgImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedUrl = await resizeImage(file, 1500, 1500);
      setProfileData((prev) => {
        if (prev.bgImage && prev.bgImage.startsWith('blob:')) {
          URL.revokeObjectURL(prev.bgImage);
        }
        return { ...prev, bgImage: resizedUrl };
      });
    } catch (err) {
      console.error(err);
      alert('背景画像の読み込みに失敗しました。');
    }
  };

  const handleBgImageReset = () => {
    setProfileData((prev) => {
      if (prev.bgImage && prev.bgImage.startsWith('blob:')) {
        URL.revokeObjectURL(prev.bgImage);
      }
      return {
        ...prev,
        bgImage: null,
        bgPositionX: 0,
        bgPositionY: 0,
        bgScale: 100
      };
    });

    if (bgImageInputRef.current) {
      bgImageInputRef.current.value = '';
    }
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitForRender = async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  };

  const waitForAssets = async (root) => {
    const images = Array.from(root.querySelectorAll('img'));

    await Promise.all(
      images.map(async (img) => {
        if (img.complete) {
          if (img.naturalWidth > 0 && typeof img.decode === 'function') {
            try {
              await img.decode();
            } catch { }
          }
          return;
        }

        await new Promise((resolve) => {
          const done = () => resolve();
          img.onload = done;
          img.onerror = done;
        });

        if (typeof img.decode === 'function') {
          try {
            await img.decode();
          } catch { }
        }
      })
    );

    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch { }
    }
  };

  const createCaptureClone = async (sourceEl) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.width = '756px';
    wrapper.style.height = '1375px';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.opacity = '1';
    wrapper.style.zIndex = '-1';
    wrapper.style.background = 'transparent';

    const clone = sourceEl.cloneNode(true);
    clone.id = 'card-preview-clone';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.opacity = '1';
    clone.style.visibility = 'visible';
    clone.style.display = 'flex';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 透過キャプチャのために背景レイヤーを完全にDOMから削除する
    // （display:noneだと内部の画像タグがSVG変換プロセスに巻き込まれ、結局iOSのメモリをパンクさせるため）
    const bgLayer = wrapper.querySelector('#bg-layer');
    if (bgLayer) {
      bgLayer.parentNode.removeChild(bgLayer);
    }

    // CRITICAL iOS FIX: Cloned DOM nodes lose their image buffers in WebKit. 
    // We must manually force WebKit to re-hydrate every image by re-assigning the src.
    const containerImages = wrapper.querySelectorAll('img');
    containerImages.forEach(img => {
      const currentSrc = img.src;
      img.src = '';
      img.src = currentSrc;
    });

    await waitForRender();
    await waitForAssets(wrapper);

    // iOS Safari特例対応：巨大なBase64アイコン画像もSVGレンダラを爆破するため、
    // DOMから完全に取り除き、透過した穴を開けておく。座標だけ控えてネイティブCanvasで自前描画する。
    let avatarMeta = null;
    const avatarImg = wrapper.querySelector('.avatar-img');
    const avatarFrame = wrapper.querySelector('.avatar-frame');
    if (avatarImg && avatarFrame) {
      const wRect = wrapper.getBoundingClientRect();
      const fRect = avatarFrame.getBoundingClientRect();
      avatarMeta = {
        src: profileData.image, // Base64
        x: fRect.left - wRect.left,
        y: fRect.top - wRect.top,
        width: fRect.width,
        height: fRect.height
      };

      avatarImg.parentNode.removeChild(avatarImg);
      avatarFrame.style.background = 'transparent';
    }

    await wait(120);

    return { wrapper, clone, avatarMeta };
  };

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);

    let objectUrl = null;
    let wrapper = null;

    try {
      const now = Date.now();
      const diff = now - lastExportAtRef.current;
      if (diff < 1200) {
        await wait(1200 - diff);
      }
      lastExportAtRef.current = Date.now();

      const sourceEl = document.getElementById('card-preview');
      if (!sourceEl) {
        throw new Error('card-preview が見つかりません。');
      }

      const isMobile =
        window.innerWidth <= 768 ||
        /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);

      const mimeType = isMobile ? 'image/jpeg' : 'image/png';
      const fileName = isMobile ? 'kancolle_profile.jpg' : 'kancolle_profile.png';

      await waitForRender();
      await waitForAssets(sourceEl);

      const prepared = await createCaptureClone(sourceEl);
      wrapper = prepared.wrapper;
      const target = prepared.clone;
      const avatarMeta = prepared.avatarMeta;

      const options = {
        scale: isMobile ? 0.75 : 2,
        quality: 0.9,
        width: 756,
        height: 1375,
        backgroundColor: 'transparent',
        font: false, // 超重要：Google Fonts（Noto Sans JP等）のBase64埋め込みを無効化し、SVGサイズを数MBから数KBに削減してiOSメモリパンクを完全回避
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          margin: '0',
          opacity: '1',
          visibility: 'visible',
          display: 'flex'
        }
      };

      // UI部分だけを軽量なPNGではなくCanvasとして直接抽出（内部のCanvasをJavaScriptで強制破棄できるようにするため）
      const uiCanvas = await domToCanvas(target, options);

      if (!uiCanvas) {
        throw new Error('UIレイヤーの生成に失敗しました。');
      }

      // ネイティブCanvasを自前で用意して画像を合成する（iOS特有の巨大SVGメモリパンクを完全回避）
      const canvas = document.createElement('canvas');
      const scale = options.scale;
      const cw = 756 * scale;
      const ch = 1375 * scale;
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');

      // 1. ベースの背景色を塗りつぶし
      ctx.fillStyle = '#283d3f';
      ctx.fillRect(0, 0, cw, ch);

      // 画像読み込み用ヘルパー
      const loadImg = (src) => new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

      // 2. デフォルト背景画像を描画（object-fit: coverの計算）
      const defaultImg = await loadImg(defaultBgUrl);
      if (defaultImg) {
        const imgRatio = defaultImg.width / defaultImg.height;
        const canvasRatio = cw / ch;
        let drawW = cw;
        let drawH = ch;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawW = ch * imgRatio;
          offsetX = -(drawW - cw) / 2;
        } else {
          drawH = cw / imgRatio;
          offsetY = -(drawH - ch) / 2;
        }
        ctx.drawImage(defaultImg, offsetX, offsetY, drawW, drawH);
      }

      // 3. ユーザーのカスタム背景を描画（right, bottom基準のcontain風）
      if (profileData.bgImage) {
        const customImg = await loadImg(profileData.bgImage);
        if (customImg) {
          const logicW = 756 * (profileData.bgScale / 100);
          const logicH = logicW * (customImg.height / customImg.width);
          const logicX = 756 - logicW - (-profileData.bgPositionX);
          const logicY = 1375 - logicH - (-profileData.bgPositionY);

          ctx.drawImage(
            customImg,
            logicX * scale,
            logicY * scale,
            logicW * scale,
            logicH * scale
          );
        }
      }

      // 3.5. アイコン画像をネイティブCanvasで描画（UIレイヤーの裏の「透明な穴」から見えるように配置）
      if (avatarMeta && avatarMeta.src) {
        const aImg = await loadImg(avatarMeta.src);
        if (aImg) {
          ctx.save();
          const ax = avatarMeta.x * scale;
          const ay = avatarMeta.y * scale;
          const aw = avatarMeta.width * scale;
          const ah = avatarMeta.height * scale;
          const radius = 8 * scale; // border-radius: 8px に対応

          ctx.beginPath();
          ctx.roundRect(ax, ay, aw, ah, radius);
          ctx.clip();
          ctx.drawImage(aImg, ax, ay, aw, ah);
          ctx.restore();
        }
      }

      // 4. UIレイヤーを描画（前面重ね）
      ctx.drawImage(uiCanvas, 0, 0, cw, ch);

      // 【極めて重要】modern-screenshot内部で生成された巨大CanvasのメモリをJavaScript側で強制破棄
      uiCanvas.width = 0;
      uiCanvas.height = 0;

      // 5. 最終的な1枚絵としてBlobに出力
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Canvasの合成に失敗しました。'));
        }, mimeType, 0.9);
      });

      // 【極めて重要】iOS SafariのCanvas強制メモリ解放
      canvas.width = 0;
      canvas.height = 0;

      if (!blob || blob.size === 0) {
        throw new Error('最終Blobの生成に失敗しました。');
      }

      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], fileName, { type: mimeType });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: '艦これ自己紹介カード'
            });
            return;
          }
        } catch (shareErr) {
          console.log('Share API cancelled or failed:', shareErr);
        }
      }

      objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error saving image:', err);
      alert('画像の保存に失敗しました。');
    } finally {
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }

      if (objectUrl) {
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 2000);
      }

      setIsExporting(false);
    }
  };

  const handlePostToX = () => {
    const text = encodeURIComponent(
      '艦これ自己紹介カードを作成しました！\n\n#艦これ\n#艦これ自己紹介カード'
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">艦これ自己紹介カードメーカー</h1>
      </header>

      <main className="main-content">
        <section className="glass-panel form-panel">
          <div className="form-group">
            <label className="form-label">アイコン画像</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="form-group">
            <label className="form-label">提督名</label>
            <input type="text" name="name" value={profileData.name} onChange={handleChange} placeholder="あなたの提督名を入力" autoComplete="off" />
          </div>

          <div className="form-group">
            <label className="form-label">X (旧Twitter) での名前</label>
            <input type="text" name="twitterName" value={profileData.twitterName} onChange={handleChange} placeholder="X(旧Twitter)での名前を入力" autoComplete="off" />
          </div>

          <div className="form-group">
            <label className="form-label">着任時期</label>
            <input type="text" name="joinDate" value={profileData.joinDate} onChange={handleChange} placeholder="例: 2013年春" autoComplete="off" />
          </div>

          <div className="form-group">
            <label className="form-label">所属サーバー</label>
            <PulldownMenu />
          </div>

          <div className="form-group">
            <label className="form-label">普段のプレイスタイル</label>
            <div className="radio-group">
              {['ゆるふわ勢', 'ライト勢', 'ガチ勢'].map((opt) => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="playStyle" value={opt} checked={profileData.playStyle === opt} onChange={handleChange} style={{ display: 'none' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">イベントでの難易度</label>
            <div className="radio-group">
              {['甲', '乙', '丙', '丁', '未回答'].map((opt) => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="difficulty" value={opt} checked={profileData.difficulty === opt} onChange={handleChange} style={{ display: 'none' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">好きな艦娘</label>
            <textarea name="favoriteChars" value={profileData.favoriteChars} onChange={handleChange} placeholder="例: 時雨、夕立、大和" rows={3} autoComplete="off" />
          </div>

          <div className="form-group">
            <label className="form-label">アニメ視聴歴</label>
            <div className="radio-group">
              {['1期', '劇場版', '2期'].map((opt) => (
                <label key={opt} className="radio-label">
                  <input type="checkbox" name="animeHistory" value={opt} checked={profileData.animeHistory.includes(opt)} onChange={handleCheckboxChange} style={{ display: 'none' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">リアルイベントへの参加</label>
            <div className="radio-group">
              {['行っている', '行きたい', '行ったことはない'].map((opt) => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="realEvents" value={opt} checked={profileData.realEvents === opt} onChange={handleChange} style={{ display: 'none' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">他プレイ中のゲーム</label>
            <textarea name="otherGames" value={profileData.otherGames} onChange={handleChange} placeholder="その他プレイしているゲーム" rows={3} autoComplete="off" />
          </div>

          <div className="form-group">
            <label className="form-label">フリースペース</label>
            <textarea name="freeSpace" value={profileData.freeSpace} onChange={handleChange} placeholder="自己紹介、挨拶、甲勲章の数、好きな艦娘、未所持艦娘などご自由に！" rows={4} autoComplete="off" />
          </div>

          <div className="form-group">
            <label className="form-label">背景画像</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="file" accept="image/*" onChange={handleBgImageUpload} ref={bgImageInputRef} />
              {profileData.bgImage && (
                <button type="button" className="btn btn-secondary" onClick={handleBgImageReset} style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.75rem' }}>
                  リセット
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">背景画像の横位置 ({profileData.bgPositionX}px)</label>
            <input type="range" name="bgPositionX" min="-1500" max="1500" value={profileData.bgPositionX} onChange={handleChange} disabled={!profileData.bgImage} />
          </div>

          <div className="form-group">
            <label className="form-label">背景画像の縦位置 ({profileData.bgPositionY}px)</label>
            <input type="range" name="bgPositionY" min="-1500" max="1500" value={profileData.bgPositionY} onChange={handleChange} disabled={!profileData.bgImage} />
          </div>

          <div className="form-group">
            <label className="form-label">背景画像の拡大率 ({profileData.bgScale}%)</label>
            <input type="range" name="bgScale" min="50" max="300" value={profileData.bgScale} onChange={handleChange} disabled={!profileData.bgImage} />
          </div>
        </section>

        <section className="preview-panel">
          <div className="glass-panel preview-container">
            <div className="kancolle-card-wrapper" id="capture-wrapper">
              <ProfileCard profileData={profileData} defaultBgUrl={defaultBgUrl} />
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleDownload} disabled={isExporting}>
              <Download size={20} />
              画像を保存する
            </button>
            <button className="btn btn-twitter" onClick={handlePostToX}>
              Xでポストする
            </button>
          </div>

          {isExporting && (
            <div className="export-progress">
              <Loader2 className="spin" size={24} />
              <span>画像生成中です...</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;