import React, { useState } from 'react';
import { IonIcon, IonModal } from '@ionic/react';
import { closeOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './PhotoGallery.css';

interface Props {
  photos: string[];
  alt: string;
  className?: string;
}

const PhotoGallery: React.FC<Props> = ({ photos, alt, className }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openAt = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        className={`photo-gallery-swiper ${className ?? ''}`}
        onSlideChange={(s) => setLightboxIndex(s.activeIndex)}
      >
        {photos.map((url, i) => (
          <SwiperSlide key={i} onClick={() => openAt(i)}>
            <img src={url} alt={alt} className="photo-gallery-img" />
          </SwiperSlide>
        ))}
      </Swiper>

      <IonModal
        isOpen={lightboxOpen}
        onDidDismiss={() => setLightboxOpen(false)}
        className="photo-gallery-modal"
      >
        <div className="photo-gallery-modal-inner">
          <button className="photo-gallery-close" onClick={() => setLightboxOpen(false)}>
            <IonIcon icon={closeOutline} />
          </button>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            initialSlide={lightboxIndex}
            className="photo-gallery-fullswiper"
          >
            {photos.map((url, i) => (
              <SwiperSlide key={i} className="photo-gallery-fullslide">
                <img src={url} alt={alt} className="photo-gallery-fullimg" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </IonModal>
    </>
  );
};

export default PhotoGallery;
