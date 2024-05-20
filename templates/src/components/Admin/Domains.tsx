import { prodDomains, devDomains } from '@server/domains';

const domains = import.meta.env.DEV ? devDomains : prodDomains;

export default function Domains() {
  return (
    <div class="md:pt4">
      <div class="bg-white/20 overflow-hidden md:(rounded-md shadow-md)">
        <table class="w-full">
          <thead class="text-left">
            <tr class="bg-black/10">
              <th class="p4 b-r b-black/10">Host</th>
              <th class="p4 b-r b-black/10">Scope</th>
              <th class="p4">Configured</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr>
                <td class="px4 py1 b-b b-r b-black/10">{d.host}</td>
                <td class="px4 py1 b-b b-r b-black/10">{d.scope}</td>
                <td class="px4 py1 b-b b-black/10">???</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
