import React, { useState, useRef, useEffect } from 'react';
{/* import { domToCanvas } from 'modern-screenshot'; */ }
import { domToBlob } from 'modern-screenshot';
import { Download, Twitter, Loader2 } from 'lucide-react';
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
  const [defaultBgBase64, setDefaultBgBase64] = useState('');

  const cardRef = useRef(null);
  const bgImageInputRef = useRef(null);

  useEffect(() => {
    const fetchDefaultBg = async () => {
      try {
        const isMobile = window.innerWidth <= 768 || /iPad|iPhone|iPod/.test(navigator.userAgent);
        const bgFilename = isMobile ? 'bg2_small.jpg' : 'bg2.png';
        const response = await fetch(`${import.meta.env.BASE_URL}${bgFilename}`);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setDefaultBgBase64(reader.result);
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to load default background', err);
      }
    };
    fetchDefaultBg();
  }, []);

  const resizeImage = (file, maxWidth, maxHeight, callback) => {
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
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL(file.type || 'image/png', 0.9));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const serverName = [
    "横須賀鎮守府",
    "呉鎮守府",
    "佐世保鎮守府",
    "舞鶴鎮守府",
    "大湊警備府",
    "トラック泊地",
    "リンガ泊地",
    "ラバウル基地",
    "ショートランド泊地",
    "ブイン基地",
    "タウイタウイ泊地",
    "パラオ泊地",
    "ブルネイ泊地",
    "単冠湾泊地",
    "幌筵泊地",
    "宿毛湾泊地",
    "鹿屋基地",
    "岩川基地",
    "佐伯湾泊地",
    "柱島泊地"
  ];

  const PulldownMenu = () => {
    return (
      <select
        name="server"
        value={profileData.server}
        onChange={handleChange}
      >
        <option value="">未選択</option>
        {serverName.map((server) => {
          return <option key={server} value={server}>{server}</option>
        })}
      </select>
    );
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setProfileData(prev => {
      const currentArray = prev[name] || [];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return { ...prev, [name]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, 800, 800, (resizedUrl) => {
        setProfileData(prev => ({ ...prev, image: resizedUrl }));
      });
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, 1500, 1500, (resizedUrl) => {
        setProfileData(prev => ({ ...prev, bgImage: resizedUrl }));
      });
    }
  };

  const handleBgImageReset = () => {
    setProfileData(prev => ({
      ...prev,
      bgImage: null,
      bgPositionX: 0,
      bgPositionY: 0,
      bgScale: 100
    }));
    if (bgImageInputRef.current) {
      bgImageInputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const cardElement = document.getElementById("card-preview");
      if (!cardElement) {
        return;
      }

      const isMobile =
        window.innerWidth <= 768 ||
        /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);

      const mimeType = isMobile ? "image/jpeg" : "image/png";
      const fileName = isMobile
        ? "kancolle_profile.jpg"
        : "kancolle_profile.png";

      const blob = await domToBlob(cardElement, {
        scale: isMobile ? 0.8 : 2,
        quality: 0.9,
        width: 756,
        height: 1375,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          margin: "0",
        },
      });

      if (!blob) {
        throw new Error("Blobの生成に失敗しました。");
      }

      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], fileName, { type: mimeType });

          if (
            navigator.canShare &&
            navigator.canShare({ files: [file] })
          ) {
            await navigator.share({
              files: [file],
              title: "艦これ自己紹介カード",
            });
            return;
          }
        } catch (shareErr) {
          console.log("Share API cancelled or failed:", shareErr);
        }
      }

      const objectUrl = URL.createObjectURL(blob);

      try {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 1000);
      }
    } catch (err) {
      console.error("Error saving image:", err);
      alert("画像の保存に失敗しました。");
    } finally {
      setIsExporting(false);
    }
  };

  {/*const handleDownload = async () => {
    setIsExporting(true);

    // Wait for the DOM to update with the 'export-mode' class
    setTimeout(async () => {
      const cardElement = document.getElementById('card-preview');
      if (!cardElement) {
        setIsExporting(false);
        return;
      }

      try {
        const isMobile = window.innerWidth <= 768 || /iPad|iPhone|iPod/.test(navigator.userAgent);
        const config = {
          scale: isMobile ? 1.0 : 2.0, // Scale set to 1.0 for mobile to absolutely minimize memory footprint
          quality: 0.9,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            margin: '0',
          },
          width: 756,
          height: 1375,
        };

        const canvas = await domToCanvas(cardElement, config);

        // iOS strictly limits canvas memory count. By creating a Blob natively from the Canvas,
        // we avoid massive string duplicates, and can manually destroy the Canvas immediately.
        if (isMobile && navigator.share) {
          try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            // CRITICAL: Manually zero-out canvas dimensions to force WebKit to instantly drop the memory buffer
            canvas.width = 0;
            canvas.height = 0;

            const file = new File([blob], 'kancolle_profile.jpg', { type: 'image/jpeg' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: '艦これ自己紹介カード',
              });
              setIsExporting(false);
              return; // Successful share/save via native OS dialogue!
            }
          } catch (shareErr) {
            console.log('Share API cancelled or failed:', shareErr);
          }
        }

        const dataUrl = canvas.toDataURL(isMobile ? 'image/jpeg' : 'image/png', 0.9);

        // CRITICAL iOS FIX: Free memory immediately
        canvas.width = 0;
        canvas.height = 0;

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = isMobile ? 'kancolle_profile.jpg' : 'kancolle_profile.png';
        link.click();
      } catch (err) {
        console.error('Error saving image:', err);
        alert('画像の保存に失敗しました。');
      } finally {
        setIsExporting(false);
      }
    }, 150); // Small delay to guarantee browser repaints
  };*/}

  const handlePostToX = () => {
    const text = encodeURIComponent('艦これ自己紹介カードを作成しました！\n\n#艦これ\n#艦これ自己紹介カード');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">艦これ自己紹介カードメーカー</h1>
      </header>

      <main className="main-content">
        {/* Left Side: Input Form */}
        <section className="glass-panel form-panel">

          <div className="form-group">
            <label className="form-label">アイコン画像</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="form-group">
            <label className="form-label">提督名</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              placeholder="あなたの提督名を入力"
              autocomplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">X (旧Twitter) での名前</label>
            <input
              type="text"
              name="twitterName"
              value={profileData.twitterName}
              onChange={handleChange}
              placeholder="X(旧Twitter)での名前を入力"
              autocomplete="off"
            />
          </div>

          {/*<div className="form-group">
            <label className="form-label">性別</label>
            <div className="radio-group">
              {['男性♂', '女性♀', 'その他', '秘密'].map(opt => (
                <label key={opt} className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value={opt}
                    checked={profileData.gender === opt}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>*/}

          <div className="form-group">
            <label className="form-label">着任時期</label>
            <input
              type="text"
              name="joinDate"
              value={profileData.joinDate}
              onChange={handleChange}
              placeholder="例: 2013年春"
              autocomplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">所属サーバー</label>
            <PulldownMenu />
          </div>

          <div className="form-group">
            <label className="form-label">普段のプレイスタイル</label>
            <div className="radio-group">
              {['ゆるふわ勢', 'ライト勢', 'ガチ勢'].map(opt => (
                <label key={opt} className="radio-label">
                  <input
                    type="radio"
                    name="playStyle"
                    value={opt}
                    checked={profileData.playStyle === opt}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">イベントでの難易度</label>
            <div className="radio-group">
              {['甲', '乙', '丙', '丁', '未回答'].map(opt => (
                <label key={opt} className="radio-label">
                  <input
                    type="radio"
                    name="difficulty"
                    value={opt}
                    checked={profileData.difficulty === opt}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">好きな艦娘</label>
            <textarea
              name="favoriteChars"
              value={profileData.favoriteChars}
              onChange={handleChange}
              placeholder="例: 時雨、夕立、大和"
              rows={3}
              autocomplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">アニメ視聴歴</label>
            <div className="radio-group">
              {['1期', '劇場版', '2期'].map(opt => (
                <label key={opt} className="radio-label">
                  <input
                    type="checkbox"
                    name="animeHistory"
                    value={opt}
                    checked={profileData.animeHistory.includes(opt)}
                    onChange={handleCheckboxChange}
                    style={{ display: 'none' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">リアルイベントへの参加</label>
            <div className="radio-group">
              {['行っている', '行きたい', '行ったことはない'].map(opt => (
                <label key={opt} className="radio-label">
                  <input
                    type="radio"
                    name="realEvents"
                    value={opt}
                    checked={profileData.realEvents === opt}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">他プレイ中のゲーム</label>
            <textarea
              name="otherGames"
              value={profileData.otherGames}
              onChange={handleChange}
              placeholder="その他プレイしているゲーム"
              rows={3}
              autocomplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">フリースペース</label>
            <textarea
              name="freeSpace"
              value={profileData.freeSpace}
              onChange={handleChange}
              placeholder="自己紹介、挨拶、甲勲章の数、好きな艦娘、未所持艦娘などご自由に！"
              rows={4}
              autocomplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">背景画像</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleBgImageUpload}
                ref={bgImageInputRef}
              />
              {profileData.bgImage && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBgImageReset}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.75rem' }}
                >
                  リセット
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">背景画像の横位置 ({profileData.bgPositionX}px)</label>
            <input
              type="range"
              name="bgPositionX"
              min="-1500"
              max="1500"
              value={profileData.bgPositionX}
              onChange={handleChange}
              disabled={!profileData.bgImage}
            />
          </div>

          <div className="form-group">
            <label className="form-label">背景画像の縦位置 ({profileData.bgPositionY}px)</label>
            <input
              type="range"
              name="bgPositionY"
              min="-1500"
              max="1500"
              value={profileData.bgPositionY}
              onChange={handleChange}
              disabled={!profileData.bgImage}
            />
          </div>

          <div className="form-group">
            <label className="form-label">背景画像の拡大率 ({profileData.bgScale}%)</label>
            <input
              type="range"
              name="bgScale"
              min="50"
              max="300"
              value={profileData.bgScale}
              onChange={handleChange}
              disabled={!profileData.bgImage}
            />
          </div>
        </section>

        {/* Right Side: Preview & Actions */}
        <section className="preview-panel">
          <div className="glass-panel preview-container">
            <div className="kancolle-card-wrapper" id="capture-wrapper">
              <ProfileCard profileData={profileData} isExporting={isExporting} defaultBgBase64={defaultBgBase64} />
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
              <span>画像生成中です... 少々お待ちください</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
