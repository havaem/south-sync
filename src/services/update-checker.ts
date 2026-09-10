import Constants from 'expo-constants';

const GITHUB_REPO = (Constants.expoConfig?.extra?.githubRepo as string | undefined) ?? '';

export type UpdateCheckResult = {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  downloadUrl: string | null;
  releaseNotes: string;
};

function parseVersion(version: string): number[] {
  return version
    .replace(/^v/i, '')
    .split('.')
    .map((part) => parseInt(part, 10) || 0);
}

function isNewerVersion(latest: string, current: string): boolean {
  const latestParts = parseVersion(latest);
  const currentParts = parseVersion(current);
  const length = Math.max(latestParts.length, currentParts.length);

  for (let i = 0; i < length; i++) {
    const latestPart = latestParts[i] ?? 0;
    const currentPart = currentParts[i] ?? 0;
    if (latestPart !== currentPart) return latestPart > currentPart;
  }
  return false;
}

export function getCurrentVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (!GITHUB_REPO) {
    throw new Error('Chưa cấu hình repo GitHub (expo.extra.githubRepo trong app.json)');
  }

  const currentVersion = getCurrentVersion();
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
  if (!response.ok) {
    throw new Error('Không kiểm tra được cập nhật (không tìm thấy release nào trên GitHub)');
  }

  const release = await response.json();
  const latestVersion: string = release.tag_name ?? currentVersion;
  const assets: { name?: string; browser_download_url?: string }[] = release.assets ?? [];
  const apkAsset = assets.find((asset) => asset.name?.toLowerCase().endsWith('.apk'));

  return {
    hasUpdate: isNewerVersion(latestVersion, currentVersion),
    currentVersion,
    latestVersion,
    releaseUrl: release.html_url ?? `https://github.com/${GITHUB_REPO}/releases/latest`,
    downloadUrl: apkAsset?.browser_download_url ?? null,
    releaseNotes: typeof release.body === 'string' ? release.body : '',
  };
}
