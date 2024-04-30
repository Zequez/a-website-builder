import { useAuth } from '@app/lib/AuthContext';
import * as api from '@app/lib/apiPipes';
import { useEffect, useState } from 'preact/hooks';

export const STATE = {
  membersWithSharedResources: {
    ezequiel: {
      id: 1,
      tag: 'ezequiel',
    },
  },
  selectedMember: 1,
  loadedMembers: [1],
  sharedResources: [],
  availableSites: [],
};

export function useEditorState() {
  const { memberAuth, fullMember } = useAuth();
  const [membersWithSharedResources, setMembersWithSharedResources] =
    useState<Awaited<ReturnType<typeof api.membersWithSharedResources>>>();

  const [sharedResourcesByMember, setSharedResourcesByMember] = useState<{
    [key: string]: Awaited<ReturnType<typeof api.sharedResourcesByMemberId>>;
  }>({});

  async function fetchSharedResourcesData() {
    const members = await api.membersWithSharedResources({});
    setMembersWithSharedResources(members);
  }

  async function fetchSharedResourcesByMemberId(id: number) {
    const sharedResourcesForMember = await api.sharedResourcesByMemberId({ memberId: 1 });
    setSharedResourcesByMember((v) => {
      return { ...v, [id]: sharedResourcesForMember };
    });
  }

  const [memberSites, setMemberSites] = useState<Awaited<ReturnType<typeof api.memberSites>>>();
  async function fetchMemberSites(memberId: number) {
    const sites = await api.memberSites({ memberId });
    setMemberSites(sites);
    if (sites[0]) {
      fetchSiteFiles(sites[0].id);
    }
  }

  const [selectedSite, setSelectedSite] = useState<string>();
  const [sitesFiles, setSitesFiles] = useState<{
    [key: string]: Awaited<ReturnType<typeof api.siteFiles>>;
  }>({});
  async function fetchSiteFiles(siteId: string) {
    setSelectedSite(siteId);
    const siteFiles = await api.siteFiles({ siteId });
    setSitesFiles((v) => ({ ...v, [siteId]: siteFiles }));
  }

  useEffect(() => {
    fetchSharedResourcesData();
    if (memberAuth) {
      fetchSharedResourcesByMemberId(memberAuth.member.id);
      fetchMemberSites(memberAuth.member.id);
    }
  }, []);
  // }, [memberAuth]);
  // useRemoteResource(sharedResourcesByMemberId, {memberId: 1});

  return {
    memberAuth,
    fullMember,
    memberSites,
    sitesFiles,
    selectedSite,
    fetchSiteFiles,
    membersWithSharedResources,
    sharedResourcesByMember,
    fetchSharedResourcesByMemberId,
  };
}
