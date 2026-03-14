import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  homeOutline,
  homeSharp,
  carOutline,
  carSharp,
  mapOutline,
  mapSharp,
  businessOutline,
  businessSharp,
  personOutline,
  personSharp,
} from 'ionicons/icons';
import Home from './pages/Home';
import Houses from './pages/Houses';
import Cars from './pages/Cars';
import Tours from './pages/Tours';
import HouseDetail from './pages/HouseDetail';
import CarDetail from './pages/CarDetail';
import TourDetail from './pages/TourDetail';
import Account from './pages/Account';
import MyCars from './pages/MyCars';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import MyHouses from './pages/MyHouses';
import AddHouse from './pages/AddHouse';
import EditHouse from './pages/EditHouse';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/houses">
            <Houses />
          </Route>
          <Route exact path="/houses/:id">
            <HouseDetail />
          </Route>
          <Route exact path="/cars">
            <Cars />
          </Route>
          <Route exact path="/cars/:id">
            <CarDetail />
          </Route>
          <Route exact path="/tours">
            <Tours />
          </Route>
          <Route exact path="/tours/:id">
            <TourDetail />
          </Route>
          <Route exact path="/account">
            <Account />
          </Route>
          <Route exact path="/my-cars">
            <MyCars />
          </Route>
          <Route exact path="/add-car">
            <AddCar />
          </Route>
          <Route exact path="/edit-car/:id">
            <EditCar />
          </Route>
          <Route exact path="/my-houses">
            <MyHouses />
          </Route>
          <Route exact path="/add-house">
            <AddHouse />
          </Route>
          <Route exact path="/edit-house/:id">
            <EditHouse />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon aria-hidden="true" ios={homeOutline} md={homeSharp} />
            <IonLabel>Главная</IonLabel>
          </IonTabButton>
          <IonTabButton tab="houses" href="/houses">
            <IonIcon aria-hidden="true" ios={businessOutline} md={businessSharp} />
            <IonLabel>Дома</IonLabel>
          </IonTabButton>
          <IonTabButton tab="cars" href="/cars">
            <IonIcon aria-hidden="true" ios={carOutline} md={carSharp} />
            <IonLabel>Авто</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tours" href="/tours">
            <IonIcon aria-hidden="true" ios={mapOutline} md={mapSharp} />
            <IonLabel>Туры</IonLabel>
          </IonTabButton>
          <IonTabButton tab="account" href="/account">
            <IonIcon aria-hidden="true" ios={personOutline} md={personSharp} />
            <IonLabel>Кабинет</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
