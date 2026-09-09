// // <api>2<Local>
// import {
//   IClientAttachmentsType,
//   IClientVariantImageType,
//   IMediaItemType,
// } from '@/shared/_service/interface.schema';
// type SelectOption = {
//   key: string;
//   value: string;
// };

// type BaseLocationItem = {
//   id: string;
//   name: string;
// };

// const createSelectOptions = <T extends BaseLocationItem>(items?: T[]): SelectOption[] => {
//   return (
//     items?.map((item) => ({
//       key: item.id,
//       value: item.name,
//     })) ?? []
//   );
// };
// export const adaptVariantImagesToMedia = (images?: IClientVariantImageType[]): IMediaItemType[] => {
//   if (!images?.length) return [];

//   return [...images]
//     .sort((a, b) => a.order - b.order)
//     .map((image) => ({
//       type: 'image',
//       src: image.imageUrl ?? '',
//       thumb: image.imageUrl ?? '',
//     }));
// };
// export const adaptVariantMediaToMedia = (
//   images?: IClientVariantImageType[],
//   video?: IClientAttachmentsType
// ): IMediaItemType[] => [
//   ...(video
//     ? [
//         {
//           type: 'video' as const,
//           src: video.attachmentUrl,
//         },
//       ]
//     : []),
//   ...adaptVariantImagesToMedia(images),
// ];
// export { createSelectOptions };
