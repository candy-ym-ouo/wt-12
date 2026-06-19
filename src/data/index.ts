import type { StoryPackage, StoryPackageSummary } from './types';
import { neuralProtocol } from './sampleStory';
import { echoesOfVoid } from './echoesOfVoid';
import { starlightCafe } from './starlightCafe';

export const storyPackages: StoryPackage[] = [
  neuralProtocol,
  echoesOfVoid,
  starlightCafe,
];

export const storyPackageMap: Record<string, StoryPackage> = {
  'neural-protocol': neuralProtocol,
  'echoes-of-void': echoesOfVoid,
  'starlight-cafe': starlightCafe,
};

export const storyPackageSummaries: StoryPackageSummary[] = storyPackages.map(
  (pkg): StoryPackageSummary => ({
    id: pkg.id,
    title: pkg.title,
    subtitle: pkg.subtitle,
    description: pkg.description,
    coverImage: pkg.coverImage,
    author: pkg.author,
    difficulty: pkg.difficulty,
    genre: pkg.genre,
    estimatedPlaytime: pkg.estimatedPlaytime,
    totalEndings: pkg.endings.length,
    totalChapters: pkg.chapters.length,
    totalFactions: pkg.factions?.length ?? 0,
  })
);

export function getStoryPackage(id: string): StoryPackage | undefined {
  return storyPackageMap[id];
}

export function getStorySummary(id: string): StoryPackageSummary | undefined {
  return storyPackageSummaries.find((s) => s.id === id);
}
