import React from 'react';
import './ProfileCard.css';

const ProfileCard = ({ profileData, isExporting, defaultBgBase64 }) => {
  const {
    name,
    twitterName,
    joinDate,
    server,
    playStyle,
    favoriteChars,
    animeHistory,
    difficulty,
    realEvents,
    otherGames,
    freeSpace,
    image,
    bgImage,
    bgPositionX,
    bgPositionY,
    bgScale
  } = profileData;

  const defaultBgUrl = defaultBgBase64 || new URL(`${import.meta.env.BASE_URL}bg2.png`, window.location.href).href;

  const bgContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    borderRadius: '12px'
  };

  const defaultBgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1
  };

  const customBgStyle = {
    position: 'absolute',
    right: `${-bgPositionX}px`,
    bottom: `${-bgPositionY}px`,
    width: `${bgScale}%`,
    height: 'auto',
    objectFit: 'contain',
    zIndex: 2
  };

  return (
    <div id="card-preview" className="kancolle-card">
      {/* Background Image Layers - Use <img> tags instead of CSS background-image for iOS html-to-image compatibility */}
      <div style={bgContainerStyle}>
        <img src={defaultBgUrl} style={defaultBgStyle} alt="Default Background" crossOrigin="anonymous" />
        {bgImage && (
          <img src={bgImage} style={customBgStyle} alt="Custom Background" />
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="card-header">
          <h2>艦これ自己紹介カード</h2>
        </div>

        <div className="card-body">
          {/* Left column content: Image, Name, Twitter */}
          <div className="card-left">
            <div className="avatar-section">
              <div className="avatar-frame">
                {image ? (
                  <img src={image} alt="Avatar" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">NO IMAGE</div>
                )}
              </div>

            </div>

            <div className="info-block primary-info">
              <div className="info-row">
                <span className="info-label">提督名</span>
                <span className="info-value name-value">{name || '未入力'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">X(旧Twitter)での名前</span>
                <span className="info-value xname-value">{twitterName || '未入力'}</span>
              </div>
            </div>
          </div>

          {/* Right column content: Other details */}
          <div className="card-right">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">着任時期</span>
                <span className="info-value">{joinDate || '未入力'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">所属サーバー</span>
                <span className="info-value">{server || '未選択'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">普段のプレイスタイル</span>
                <span className="info-value">{playStyle || '未選択'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">イベントでの難易度</span>
                <span className="info-value difficulty-badge" data-level={difficulty || ''}>
                  {difficulty || '未選択'}
                </span>
              </div>
            </div>

            <div className="info-block">
              <span className="info-label">好きな艦娘</span>
              <div className="info-value multi-line">{favoriteChars || '未入力'}</div>
            </div>

            <div className="info-grid half">
              <div className="info-item">
                <span className="info-label">アニメ視聴歴</span>
                <span className="info-value">
                  {Array.isArray(animeHistory) && animeHistory.length > 0
                    ? animeHistory.join('、')
                    : ''}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">リアルイベントへの参加</span>
                <span className="info-value">{realEvents || '未選択'}</span>
              </div>
            </div>

            <div className="info-block">
              <span className="info-label">他プレイ中のゲーム</span>
              <div className="info-value multi-line text-muted">{otherGames || ''}</div>
            </div>

            <div className="info-block flex-grow">
              <span className="info-label">フリースペース</span>
              <div className="info-value free-space-content pre-wrap">
                {freeSpace || 'よろしくお願いします！'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
