import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Twitter } from 'lucide-react';
import ProfileCard from './ProfileCard';
import './App.css';

function App() {
  const [profileData, setProfileData] = useState({
    name: '',
    twitterName: '',
    gender: '',
    server: '',
    playStyle: '',
    favoriteChars: '',
    animeHistory: [],
    difficulty: '',
    realEvents: '',
    otherGames: '',
    freeSpace: '',
    image: null,
    bgImage: null
  });

  const [isExporting, setIsExporting] = useState(false);

  const cardRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, bgImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);

    // Wait for the DOM to update with the 'export-mode' class
    setTimeout(async () => {
      const cardElement = document.getElementById('card-preview');
      if (!cardElement) {
        setIsExporting(false);
        return;
      }

      try {
        const dataUrl = await toPng(cardElement, {
          pixelRatio: 2.4, // 1.2x resolution scaling
          skipFonts: false
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'kancolle_profile.png';
        link.click();
      } catch (err) {
        console.error('Error saving image:', err);
        alert('画像の保存に失敗しました。');
      } finally {
        setIsExporting(false);
      }
    }, 150); // Small delay to guarantee browser repaints
  };

  const handlePostToX = () => {
    const text = encodeURIComponent('艦これ自己紹介カードを作成しました！\n#艦これ自己紹介カード');
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
            <label className="form-label">画像アップロード</label>
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
            />
          </div>

          <div className="form-group">
            <label className="form-label">X (旧Twitter) ID</label>
            <input
              type="text"
              name="twitterName"
              value={profileData.twitterName}
              onChange={handleChange}
              placeholder="例: KanColle_STAFF (＠抜きで入力)"
            />
          </div>

          <div className="form-group">
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
          </div>

          <div className="form-group">
            <label className="form-label">所属サーバー</label>
            <input
              type="text"
              name="server"
              value={profileData.server}
              onChange={handleChange}
              placeholder="例: 横須賀鎮守府"
            />
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
              {['甲', '乙', '丙', '丁'].map(opt => (
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
              {['行っている', '行ったことがない', '行きたい'].map(opt => (
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
            />
          </div>

          <div className="form-group">
            <label className="form-label">フリースペース</label>
            <textarea
              name="freeSpace"
              value={profileData.freeSpace}
              onChange={handleChange}
              placeholder="自己紹介、挨拶、着任時期、甲勲章の数、好きな艦娘などご自由に！"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">背景画像</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBgImageUpload}
            />
          </div>
        </section>

        {/* Right Side: Preview & Actions */}
        <section className="preview-panel">
          <div className="glass-panel preview-container">
            <div className="kancolle-card-wrapper" id="capture-wrapper">
              <ProfileCard profileData={profileData} isExporting={isExporting} />
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleDownload}>
              <Download size={20} />
              画像を保存する
            </button>
            <button className="btn btn-twitter" onClick={handlePostToX}>
              Xでポストする
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
