import React from 'react';
import './ProfileCard.css';

const ProfileCard = ({ profileData, isExporting }) => {
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

  const defaultBgUrl = new URL(`${import.meta.env.BASE_URL}bg2.png`, window.location.href).href;

  const cardStyle = bgImage
    ? {
      backgroundImage: `url(${bgImage}), url('${defaultBgUrl}')`,
      backgroundPosition: `calc(100% + ${bgPositionX}px) calc(100% + ${bgPositionY}px), center`,
      //backgroundSize: `${bgScale}%, cover`,
      backgroundRepeat: 'no-repeat, no-repeat'
    }
    : {
      backgroundImage: `url('${defaultBgUrl}')`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    };

  return (
    <div id="card-preview" className="kancolle-card" style={cardStyle}>
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
              <span className="info-value">{server || '未入力'}</span>
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
  );
};

export default ProfileCard;
