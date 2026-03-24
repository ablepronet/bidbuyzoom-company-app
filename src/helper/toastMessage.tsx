export interface AppToastProps {
  positionValue: number;
  backdropTransitionOutTiming: number;
  backdropTransitionInTiming: number;
  animationIn?: string;
  animationOut?: string;
  animationInTiming?: number;
  animationOutTiming?: number;
}

export interface AppToastState {
  isShow: boolean;
  text: string;
  opacityValue: any;
  barWidth: any;
  icon: string;
  duration: number;
  position: string;
  oldDuration: number;
  animationStyle: {
    [key: string]: {
      animationIn: string;
      animationOut: string;
    };
  };
}

export const defaultProps = {
  backdropTransitionOutTiming: 300,
  backdropTransitionInTiming: 300,
  animationIn: 'slideInDown',
  animationOut: 'slideOutUp',
  animationInTiming: 300,
  animationOutTiming: 300,
  positionValue: 50,
};
